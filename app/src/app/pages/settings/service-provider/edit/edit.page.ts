import { Component, ElementRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { Tables } from '@custom-types/supabase';
import { PostgrestError, QueryResult } from '@supabase/supabase-js';
import { LoadingErrorBlockComponent } from "@app/components/loading-error-block/loading-error-block.component";
import { S3ImgComponent } from "@app/components/s3-img/s3-img.component";
import { ToastComponent } from "@app/components/toast/toast.component";
import { TitleService } from '@app/services/title.service';
import { ServiceProviderEntryComponent } from '@app/components/forms/service-provider-entry/service-provider-entry.component';
import { DateService } from '@app/services/date.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TextFieldComponent } from "@app/components/forms/text-field/text-field.component";
import { SelectFieldComponent } from "@app/components/forms/select-field/select-field.component";
import { CdkDrag, CdkDragDrop, CdkDropList, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgxImageCompressService } from 'ngx-image-compress';
import { AvatarComponent } from "@app/components/avatar/avatar.component";
import { environment } from 'environments/environment';
import { QrCodeComponent, QrCodeModule } from 'ng-qrcode';
import { FileService } from '@app/services/file.service';

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
    CurrencyPipe,
    AvatarComponent,
    QrCodeModule,
  ],
})
export class EditPage {
  @ViewChild('errorToast') errorToast!: ToastComponent;
  @ViewChild('successToast') successToast!: ToastComponent;
  @ViewChild('infoToast') infoToast!: ToastComponent;

  public DateService = DateService;

  productQuery = this.api.client()
    .from('product')
    .select('*,product_prices:product_price(*)')
    // .eq('service_provider', this.id)
    .order('order');
  public id: string | null;
  public sp?: { data: Tables<'service_provider'> | null, error: PostgrestError | null };
  public hours?: { data: Tables<'service_provider_hours'>[] | null, error: PostgrestError | null };
  public products?: QueryResult<typeof this.productQuery>; //{ data: Tables<'product'>[] | null , error: PostgrestError | null };
  
  serviceMemberQuery = this.api.client().from('service_provider_member')
    .select('*,service_member_user(user(*))')
    .order('service_member_user(user(name))');
  public team?: QueryResult<typeof this.serviceMemberQuery>;

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
    thumbnail_path: new FormControl<string>(''),
  });
  resetProduct() {
    this.productForm.setValue({
      display_name: '',
      description: null,
      thumbnail_path: null,
    });
  }
  editProductImagePath: string | null = null;

  // Price Editing State
  editProductPriceId: string | null = null;
  modalForm: FormGroup = new FormGroup({
    priceModal: new FormControl<boolean>(false),
    qrModal: new FormControl<boolean>(false)
  });
  editProductPrice: Tables<'product'> | undefined | null = null;
  editPrices: Tables<'product_price'>[] | null = null;
  priceForm: FormGroup = new FormGroup({
    price: new FormControl<string>('', [Validators.required]),
    name: new FormControl<string>('', [Validators.required])
  });
  editPrice: string | null = null;
  newPrice: boolean = false;
  resetPrice() {
    this.priceForm.setValue({
      name: '',
      price: '',
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

  // Team Editing State
  newServiceMember: boolean = false;
  serviceMemberForm: FormGroup = new FormGroup({
    email: new FormControl<string>('', [Validators.required]),
    display_name: new FormControl<string>('', [Validators.required]),
    provider_id: new FormControl<string>('', [Validators.required]),
  });
  resetServiceMember() {
    this.serviceMemberForm.setValue({
      email: null,
      display_name: null,
      provider_id: this.id,
    });
  }
  qrState: null | { url: string, name: string } = null;
  @ViewChild('qrComponent', { read: ElementRef }) qrComponent?: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private titleService: TitleService,
    private imageCompress: NgxImageCompressService,
  ) {
    this.id = this.route.snapshot.params['id'];
    if(this.id) {
      this.productQuery.eq('service_provider', this.id);
      this.serviceMemberQuery.eq('service_provider', this.id);
    }
  }

  async ngOnInit() {
    if(this.id) {
      this.loadBase(this.id);
      this.loadHours(this.id);
      this.loadProducts(this.id);
      this.loadTeam(this.id);
    } else {

    }
  }

  // General
  async loadBase(id: string) {
    this.sp = await this.api.client().from('service_provider').select('*').eq('id', id).single();
    this.titleService.setTitle('Edit: ' + this.sp.data?.display_name);
  }
  async uploadHeaderPhoto() {
    if(this.id) {
      const id = this.id;
      const path = this.id + '/header_' + self.crypto.randomUUID().substring(24);

      this.imageCompress.uploadFile().then(async ({image, orientation}) => {
        this.infoToast.message("Uploading...");
        const fullUpload = await this.api.client().storage.from('service_providers').upload(path, FileService.dataURLtoBlob(image), {
          upsert: true
        });
        if(fullUpload.error) {
          this.errorToast.message(fullUpload.error.message);
          return;
        }
        await this.api.client().from('service_provider')
          .update({header_image_path: fullUpload.data?.path})
          .eq('id', id);
        console.log(fullUpload)

        this.imageCompress
          .compressFile(image, orientation, 50, 50, 240, 240) // 50% ratio, 50% quality
          .then(async compressedImage => {
            const thumbUpload = await this.api.client().storage.from('service_providers').upload(path+'_thumb', FileService.dataURLtoBlob(compressedImage), {
              upsert: true
            });
            if(thumbUpload.error) {
              this.errorToast.message(thumbUpload.error.message);
              return;
            } else {
              await this.api.client().from('service_provider')
                .update({header_thumbnail_path: thumbUpload.data?.path})
                .eq('id', id);
              if(this.sp?.data?.header_image_path) {
                this.sp.data.header_image_path = null;
              }
              await this.loadBase(id);
              this.successToast.message("Uploaded header photo");
            }
          });
      });
    }
  }
  uploadPromoPhoto(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      this.api.client().storage.from('service_providers').upload(this.sp?.data?.id + '/promo.png', fileList[0], {
        upsert: true
      }).then((data) => {
        if(data.error) {
          this.errorToast.message(data.error.message);
        } else {
          this.successToast.message("Updated Promo Photo");
        }
        if(this.id && this.sp?.data) {
          let id = this.id;
          this.api.client().from('service_provider')
            .update({promo_image_path: data.data?.path})
            .eq('id', id)
            .then(() => this.loadBase(id));
        }
      })
    }
  }
  clearPromoPhoto() {
    if(this.id && this.sp?.data) {
      let id = this.id;
      this.api.client().from('service_provider')
        .update({promo_image_path: null})
        .eq('id', id)
        .then(() => this.loadBase(id));
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
      this.products = await this.productQuery;
    }
  }
  cancelNewProduct() {
    this.newProduct = false;
  }
  startNewProduct() {
    this.resetProduct();
    this.newProduct = true;
    this.editProductImagePath = null;
  }
  saveNewProduct() {
    if(this.id) {
      let id = this.id;
      let payload = this.productForm.value;
      payload['service_provider'] = id;
      payload['order'] = this.getNextProductOrder();
      payload['image_path'] = this.editProductImagePath;
      console.log(payload)
      this.api.client().from('product').insert(payload).then((result) => {
        if(result.error) {
          this.errorToast.message(result.error.message)
        } else {
          this.successToast.message("Added Product");
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
      this.editProductImagePath = product.image_path;
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
    } else {
      this.successToast.message("Deleted Product");
    }
    if(this.id) {
      this.loadProducts(this.id)
    }
  }
  async saveEditProduct() {
    if(this.editProduct) {
      let payload = this.productForm.value;
      payload['image_path'] = this.editProductImagePath;
      console.log(this.editProduct, payload)
      const {data, error} = await this.api.client().from('product')
        .update(payload)
        .eq('id', this.editProduct);
      if(error) {
        this.errorToast.message(error.message);
      } else {
        this.successToast.message("Saved Product");
        if(this.id)
          this.loadProducts(this.id);
        this.editProduct = null;
      }
    }
  }
  async setFeaturedProduct(evt: EventTarget | null) {
    if(evt && this.id) {
      let v: string | null = (evt as HTMLSelectElement).value;
      if(v == "null") { v = null }
      const {data, error} = await this.api.client().from('service_provider').update({featured_product: v}).eq('id', this.id);
      if(error) {
        this.errorToast.message(error.message);
      } else {
        this.successToast.message("Updated Featured Product");
      }
    }
  }
  getNextProductOrder() {
    if(this.products?.data && this.products.data.length > 0) {
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
  async uploadMenuPhoto() {
      const path = this.editProduct ? (this.id + '/menu/' + this.editProduct) : (this.id + '/menu/' + self.crypto.randomUUID().substring(24));

      this.imageCompress.uploadFile().then(async ({image, orientation}) => {
        this.infoToast.message("Uploading...");
        const fullUpload = await this.api.client().storage.from('service_providers').upload(path, FileService.dataURLtoBlob(image), {
          upsert: true
        });
        if(fullUpload.error) {
          this.errorToast.message(fullUpload.error.message);
          this.editProductImagePath = null;
          return;
        }
        console.log(fullUpload)
        this.editProductImagePath = fullUpload.data.path;

        this.imageCompress
            .compressFile(image, orientation, 50, 50, 250, 250) // 50% ratio, 50% quality
            .then(async compressedImage => {
                const thumbUpload = await this.api.client().storage.from('service_providers').upload(path+'_thumb', FileService.dataURLtoBlob(compressedImage), {
                  upsert: true
                });
                if(thumbUpload.error) {
                  this.errorToast.message(thumbUpload.error.message);
                  return;
                } else {
                  this.productForm.get('thumbnail_path')?.setValue(thumbUpload.data.path);
                  this.successToast.message("Uploaded menu photo");
                }
            });
      });
  }

  // Prices
  async startEditPricesForProduct(productId: string) {
    this.editProductPriceId = productId;
    if(this.products?.data) {
      this.editProductPrice = this.products?.data?.find(x => x.id == productId);
      let priceResp = await this.api.client()
        .from('product_price')
        .select('*')
        .eq('product', productId)
        .order('price');
      if(priceResp.error) {
        this.errorToast.message(priceResp.error.message);
      }
      if(priceResp.data) {
        this.editPrices = priceResp.data;
        this.modalForm.get('priceModal')?.setValue(true);
      }
    }
  }
  async deletePrice(id: string) {
    const {data, error} = await this.api.client().from('product_price')
      .delete()
      .eq('id', id);
    if(error) {
      this.errorToast.message(error.message);
    } else {
      this.successToast.message("Deleted Price");
    }
    if(this.editProductPriceId) {
      this.startEditPricesForProduct(this.editProductPriceId);
    }
  }
  priceString(p: Tables<'product_price'>) {
    return p.price as string;
  }
  cancelNewPrice() {
    this.newPrice = false;
  }
  startNewPrice() {
    this.resetPrice();
    this.newPrice = true;
  }
  saveNewPrice() {
    console.log(this.editProductPriceId)
    if(this.editProductPriceId) {
      let productId = this.editProductPriceId;
      let payload = this.priceForm.value;
      payload['product'] = productId;
      console.log(payload)
      this.api.client().from('product_price').insert(payload).then((result) => {
        if(result.error) {
          this.errorToast.message(result.error.message);
        } else {
          this.successToast.message("Price Added");
          this.startEditPricesForProduct(productId);
          this.newPrice = false;
          if(this.id) {
            this.loadProducts(this.id);
          }
        }
      });
    }
  }
  startEditPrice(id: string) {
    let price = this.editPrices?.find((x) => x.id == id);
    if(price) {
      this.priceForm.get('name')?.setValue(price.name);
      this.priceForm.get('price')?.setValue(price.price);
      this.editPrice = id;
    }
  }
  cancelEditPrice() {
    this.editPrice = null;
  }
  async saveEditPrice() {
    if(this.editPrice) {
      let payload = this.priceForm.value;
      const {data, error} = await this.api.client().from('product_price')
        .update(payload)
        .eq('id', this.editPrice);
      if(error) {
        this.errorToast.message(error.message);
      } else {
        this.successToast.message("Price Saved");
        if(this.editProductPriceId)
          this.startEditPricesForProduct(this.editProductPriceId);
        this.editPrice = null;
      }
    }
  }
  priceModalChange(evt: Event) {
    this.editPrice = null;
    this.newPrice = false;
  }


  // Hours
  async loadHours(id: string) {
    this.hours = await this.api.client().from('service_provider_hours')
      .select('*')
      .eq('service_provider', id)
      .order('day_of_week,open_time');
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
          this.successToast.message("Added Hours");
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
    } else {
      this.successToast.message("Deleted Hours");
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
        this.successToast.message("Updated Hours");
        if(this.id)
          this.loadHours(this.id);
        this.editHour = null;
      }
    }
  }

  // Team
  async loadTeam(id: string) {
    this.team = await this.api.client().from('service_provider_member')
      .select('*,service_member_user(user(*))')
      .eq('service_provider_id', id)
      .order('name', {referencedTable: 'service_member_user.user'});
  }
  async deleteServiceMember(id: string) {
    const {data, error} = await this.api.client().from('service_provider_member')
      .delete()
      .eq('id', id);
    if(error) {
      this.errorToast.message(error.message);
    } else {
      this.successToast.message("Deleted Team Member");
    }
    if(this.id) {
      this.loadTeam(this.id)
    }
  }
  startNewServiceMember() {
    this.resetServiceMember();
    this.newServiceMember = true;
  }
  cancelNewServiceMember() {
    this.newServiceMember = false;
  }
  saveNewServiceMember() {
    if(this.id) {
      let id = this.id;
      let payload = this.serviceMemberForm.value;
      payload['service_provider'] = id;
      this.api.client().functions.invoke('invite-service-member', {
        body: payload
      }).then((result) => {
        if(result.error) {
          this.errorToast.message(result.error.message)
        } else {
          this.successToast.message("Invited Team Member");
          this.loadTeam(id)
          this.newServiceMember = false;
        }
      });
    }
  }
  openQrModal(id: string) {
    this.qrState = {
      name: this.team?.data?.find((x) => x.id == id)?.service_member_user?.user?.name ?? 'Team Member',
      url: environment.appUrl + 'review/create/member/' + id
    };
    this.modalForm.get('qrModal')?.setValue(true);
  }
  downloadQR() {
    let qr = this.qrComponent;
    console.log(qr)
    if(qr) {
      let b64 = qr.nativeElement.children[0].toDataURL("image/png");
      console.log(b64)
      let blobData = this.convertBase64ToBlob(b64)
      // saves as image
      const blob = new Blob([blobData], { type: "image/png" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      // name of the file
      link.download = (this.qrState?.name ?? 'team') + '-qrcode'
      link.click()
    }
  }
  private convertBase64ToBlob(Base64Image: string) {
    // split into two parts
    const parts = Base64Image.split(";base64,")
    // hold the content type
    const imageType = parts[0].split(":")[1]
    // decode base64 string
    const decodedData = window.atob(parts[1])
    // create unit8array of size same as row data length
    const uInt8Array = new Uint8Array(decodedData.length)
    // insert all character code into uint8array
    for (let i = 0; i < decodedData.length; ++i) {
      uInt8Array[i] = decodedData.charCodeAt(i)
    }
    // return blob image after conversion
    return new Blob([uInt8Array], { type: imageType })
  }

  daysOfWeekSelect(): {value: number | string, label: string}[] {
    return DateService.daysOfWeek.map((v, i) => { return { value: i, label: v}});
  }
}
