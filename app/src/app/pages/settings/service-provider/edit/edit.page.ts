import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { Tables } from '@custom-types/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { LoadingErrorBlockComponent } from "../../../../components/loading-error-block/loading-error-block.component";
import { S3ImgComponent } from "../../../../components/s3-img/s3-img.component";
import { ToastComponent } from "../../../../components/toast/toast.component";
import { TitleService } from '@app/services/title.service';
import { ServiceProviderEntryComponent } from '@app/components/forms/service-provider-entry/service-provider-entry.component';
import { DateService } from '@app/services/date.service';
import { CommonModule } from '@angular/common';
import { TextFieldComponent } from "../../../../components/forms/text-field/text-field.component";
import { SelectFieldComponent } from "../../../../components/forms/select-field/select-field.component";

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
    ]
})
export class EditPage {
  @ViewChild('errorToast') errorToast!: ToastComponent;
  @ViewChild('successToast') successToast!: ToastComponent;

  public DateService = DateService;

  public id: string | null;
  public sp?: { data: Tables<'service_provider'> | null, error: PostgrestError | null };
  public hours?: { data: Tables<'service_provider_hours'>[] | null, error: PostgrestError | null };


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
    } else {

    }
  }

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
  hoursFormChange(evt: Event) {
    console.log(this.hourForm.value)
  }
  daysOfWeekSelect(): {value: number | string, label: string}[] {
    return DateService.daysOfWeek.map((v, i) => { return { value: i, label: v}});
  }
}
