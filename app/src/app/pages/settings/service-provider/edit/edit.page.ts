import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { Tables } from '@custom-types/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { LoadingErrorBlockComponent } from "../../../../components/loading-error-block/loading-error-block.component";
import { S3ImgComponent } from "../../../../components/s3-img/s3-img.component";
import { ToastComponent } from "../../../../components/toast/toast.component";
import { TitleService } from '@app/services/title.service';
import { ServiceProviderEntryComponent } from '@app/components/forms/service-provider-entry/service-provider-entry.component';

@Component({
    selector: 'app-edit',
    standalone: true,
    templateUrl: './edit.page.html',
    styleUrl: './edit.page.scss',
    imports: [
        LoadingErrorBlockComponent,
        S3ImgComponent,
        ToastComponent,
        ServiceProviderEntryComponent
    ]
})
export class EditPage {
  @ViewChild('errorToast') errorToast!: ToastComponent;
  @ViewChild('successToast') successToast!: ToastComponent;

  public id: string | null;
  public sp?: { data: Tables<'service_provider'> | null, error: PostgrestError | null };


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
          this.successToast.message("Updated General");
          this.loadBase(id);
        }
      });
    }
  }
}
