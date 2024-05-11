import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { Tables } from '@custom-types/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { LoadingErrorBlockComponent } from "@app/components/loading-error-block/loading-error-block.component";
import { S3ImgComponent } from "@app/components/s3-img/s3-img.component";
import { ToastComponent } from "@app/components/toast/toast.component";
import { TitleService } from '@app/services/title.service';
import { ServiceProviderEntryComponent } from '@app/components/forms/service-provider-entry/service-provider-entry.component';
import { DateService } from '@app/services/date.service';
import { CommonModule } from '@angular/common';
import { TextFieldComponent } from "@app/components/forms/text-field/text-field.component";
import { SelectFieldComponent } from "@app/components/forms/select-field/select-field.component";
import { CdkDrag, CdkDragDrop, CdkDropList, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-edit',
    standalone: true,
    templateUrl: './edit.page.html',
    styleUrl: './edit.page.scss',
    imports: [
        LoadingErrorBlockComponent,
        S3ImgComponent,
        ToastComponent,
        ServiceProviderEntryComponent,
        ReactiveFormsModule,
        CommonModule,
        TextFieldComponent,
        SelectFieldComponent,
        DragDropModule,
        CdkDropList,
        CdkDrag,
    ]
})
export class EditPage {
  @ViewChild('errorToast') errorToast!: ToastComponent;
  @ViewChild('successToast') successToast!: ToastComponent;

  public DateService = DateService;

  public id: string | null;
  public sp?: { data: Tables<'service_provider'> | null, error: PostgrestError | null };
  public hours?: { data: Tables<'service_provider_hours'>[] | null, error: PostgrestError | null };
  public products?: { data: Tables<'product'>[] | null, error: PostgrestError | null };


  // General Editing State
  form: FormGroup = new FormGroup({
    display_name: new FormControl<string>('', [Validators.required]),
    sub_title: new FormControl<string>(''),
    phone_number: new FormControl<string>(''),
    address_1: new FormControl<string>(''),
    address_2: new FormControl<string>(''),
    city: new FormControl<string>(''),
    state: new FormControl<string>(''),
    postal_code: new FormControl<string>(''),
    website: new FormControl<string>(''),
  });


  // Product Editing State
  editProduct: string | null = null;
  newProduct: boolean = false;
  productForm: FormGroup = new FormGroup({
    display_name: new FormControl<string>('', [Validators.required]),
    description: new FormControl<string>(''),
  });
  resetProduct() {
    this.productForm.setValue({
      display_name: '',
      description: '',
    });
  }


  // Hours Editing State
  editHour: string | null = null;
  newHour: boolean = false;
  hourForm: FormGroup = new FormGroup({
    day_of_week: new FormControl<number>(1, [Validators.required]),
    open_time: new FormControl<string>('08:00', [Validators.required]),
    close_time: new FormControl<string>('20:00', [Validators.required]),
  });
  resetHours() {
    this.hourForm.setValue({
      day_of_week: 1,
      open_time: '08:00',
      close_time: '20:00',
    });
  }

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private titleService: TitleService,
  ) {
    this.id = this.route.snapshot.params['id'];
  }

  async ngOnInit() {
    if(this.id) {
      this.loadBase(this.id);
      this.loadHours(this.id);
      this.loadProducts(this.id);
    } else {

    }
  }

  // General
  async loadBase(id: string) {
    this.sp = await this.api.client().from('service_provider').select('*').eq('id', id).single();
    this.titleService.setTitle('Edit: ' + this.sp.data?.display_name);
  }
  uploadHeaderPhoto(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      this.api.client().storage.from('service_providers').upload(this.sp?.data?.id + '/header.png', fileList[0], {
        upsert: true
      }).then((data) => {
        if(data.error) {
          this.errorToast.message(data.error.message);
        } else {
          this.successToast.message("Updated General Section");
        }
        if(this.id && this.sp?.data) {
          let id = this.id;
          this.api.client().from('service_provider')
            .update({header_image_path: data.data?.path})
            .eq('id', id)
            .then(() => this.loadBase(id));
        }
      })
    }
  }
  async updateBase(input: Promise<any>) {
    let values = await input;
    if(this.id) {
      let id = this.id;
      this.api.client().from('service_provider').update(values).eq('id', id).then((result) => {
        if(result.error) {
          this.errorToast.message(result.error.message);
        } else {
          this.successToast.message("Updated General Section");
          this.loadBase(id);
        }
      });
    }
  }


  // Products
  async loadProducts(id: string | null) {
    if(id == null) {
      id = this.id;
    }
    if(id) {
      this.products = await this.api.client().from('product').select('*,product_price(*)').eq('service_provider', id).order('order');
    }
  }
  cancelNewProduct() {
    this.newProduct = false;
  }
  startNewProduct() {
    this.resetProduct();
    this.newProduct = true;
  }
  saveNewProduct() {
    if(this.id) {
      let id = this.id;
      let payload = this.productForm.value;
      payload['service_provider'] = id;
      payload['order'] = this.getNextProductOrder();
      console.log(payload)
      this.api.client().from('product').insert(payload).then((result) => {
        if(result.error) {
          this.errorToast.message(result.error.message)
        } else {
          this.loadProducts(id)
          this.newProduct = false;
        }
      });
    }
  }
  startEditProduct(id: string) {
    let product = this.products?.data?.find((x) => x.id == id);
    if(product) {
      this.productForm.get('display_name')?.setValue(product.display_name);
      this.productForm.get('description')?.setValue(product.description);
      this.editProduct = id;
    }
  }
  cancelEditProduct() {
    this.editProduct = null;
  }
  async deleteProduct(id: string) {
    const {data, error} = await this.api.client().from('product')
      .delete()
      .eq('id', id);
    if(error) {
      this.errorToast.message(error.message);
    }
    if(this.id) {
      this.loadProducts(this.id)
    }
  }
  async saveEditProduct() {
    if(this.editProduct) {
      let payload = this.productForm.value;
      console.log(this.editProduct, payload)
      const {data, error} = await this.api.client().from('product')
        .update(payload)
        .eq('id', this.editProduct);
      if(error) {
        this.errorToast.message(error.message);
      } else {
        if(this.id)
          this.loadProducts(this.id);
        this.editProduct = null;
      }
    }
  }
  getNextProductOrder() {
    if(this.products?.data) {
      return this.products.data
        .map(x => x.order)
        .reduce((prev, curr) => {
          return Math.max(prev, curr);
        }) + 1;
    } else {
      return 0;
    }
  }
  async dropProduct(event: CdkDragDrop<Tables<'product'>[]>) {
    if(this.products?.data) {
      moveItemInArray(this.products.data, event.previousIndex, event.currentIndex);
      for (let index = 0; index < this.products.data.length; index++) {
        const element = this.products.data[index];
        if(index != element.order) {
          await this.api.client().from('product').update({
            order: index
          }).eq('id', element.id);
        }
      }
      this.loadProducts(null);
    }
  }


  // Hours
  async loadHours(id: string) {
    this.hours = await this.api.client().from('service_provider_hours').select('*').eq('service_provider', id).order('day_of_week');
  }
  cancelNewHours() {
    this.newHour = false;
  }
  startNewHours() {
    this.resetHours();
    this.newHour = true;
  }
  saveNewHours() {
    if(this.id) {
      let id = this.id;
      let payload = this.hourForm.value;
      payload['service_provider'] = id;
      this.api.client().from('service_provider_hours').insert(payload).then((result) => {
        if(result.error) {
          this.errorToast.message(result.error.message)
        } else {
          this.loadHours(id)
          this.newHour = false;
        }
      });
    }

  }
  startEditHour(id: string) {
    let hour = this.hours?.data?.find((x) => x.id == id);
    if(hour) {
      this.hourForm.get('day_of_week')?.setValue(hour.day_of_week);
      this.hourForm.get('open_time')?.setValue(hour.open_time);
      this.hourForm.get('close_time')?.setValue(hour.close_time);
      this.editHour = id;
    }
  }
  cancelEditHours() {
    this.editHour = null;
  }
  async deleteHour(id: string) {
    const {data, error} = await this.api.client().from('service_provider_hours')
      .delete()
      .eq('id', id);
    if(error) {
      this.errorToast.message(error.message);
    }
    if(this.id) {
      this.loadHours(this.id)
    }
  }
  async saveEditHours() {
    if(this.editHour) {
      let payload = this.hourForm.value;
      console.log(this.editHour, payload)
      const {data, error} = await this.api.client().from('service_provider_hours')
        .update(payload)
        .eq('id', this.editHour);
      if(error) {
        this.errorToast.message(error.message);
      } else {
        if(this.id)
          this.loadHours(this.id);
        this.editHour = null;
      }
    }
  }
  
  daysOfWeekSelect(): {value: number | string, label: string}[] {
    return DateService.daysOfWeek.map((v, i) => { return { value: i, label: v}});
  }
}
