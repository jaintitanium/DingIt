import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ApiService } from '@app/services/api.service';
import { UserService } from '@app/services/user.service';
import { ToastComponent } from '@app/components/toast/toast.component';
import { Tables } from '@app/../types/supabase';
import { LoadingComponent } from "@app/components/loading/loading.component";
import { Router, RouterModule } from '@angular/router';
import { LoadingErrorBlockComponent } from "@app/components/loading-error-block/loading-error-block.component";
import { PostgrestError } from '@supabase/supabase-js';
import { AvatarComponent } from "@app/components/avatar/avatar.component";
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { TextFieldComponent } from "@app/components/forms/text-field/text-field.component";
import { WholeFormValidationComponent } from "@app/components/forms/whole-form-validation/whole-form-validation.component";
import { NgxImageCompressService } from 'ngx-image-compress';
import { FileService } from '@app/services/file.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    templateUrl: './profile.page.html',
    styleUrl: './profile.page.scss',
    imports: [
      CommonModule,
      LoadingComponent,
      LoadingErrorBlockComponent,
      AvatarComponent,
      ReactiveFormsModule,
      TextFieldComponent,
      WholeFormValidationComponent,
      ToastComponent,
      RouterModule,
    ]
})
export class ProfilePage {
  @ViewChild('infoToast') infoToast!: ToastComponent;
  @ViewChild('successToast') successToast!: ToastComponent;
  @ViewChild('errorToast') errorToast!: ToastComponent;
  data?: Tables<'user'>;
  error: PostgrestError | null = null;

  passwordForm = new FormGroup({
    password: new FormControl<string>('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl<string>('', [Validators.required]),
  }, { validators: this.checkPasswords });

  constructor(
    public usr: UserService,
    private api: ApiService,
    private router: Router,
    private imageCompress: NgxImageCompressService,
    private userService: UserService,
  ) {
    this.loadUser();
  }

  async loadUser() {
    let id = await this.usr.userId();
    if(id) {
      const {data, error} = await this.api.client().from('user')
        .select('*')
        .eq('id', id)
        .single();
      this.error = error;
      if(data) {
        this.data = data;
      }
    }
  }

  signOut() {
    this.usr.isLoggedIn.set(false);
    this.api.supabase.auth.signOut();
    this.userService.profilePhoto.set(null);
    this.router.navigate(['']);
  }

  // uploadProfilePhoto(event: Event) {
  //   const element = event.currentTarget as HTMLInputElement;
  //   let fileList: FileList | null = element.files;
  //   if (fileList) {
  //     this.api.client().storage.from('users').upload(this.data?.id + '/profile.png', fileList[0], {
  //       upsert: true
  //     }).then((data) => {
  //       if(this.data) {
  //         this.api.client().from('user')
  //           .update({profile_path: data.data?.path})
  //           .eq('id', this.data.id)
  //           .then(() => this.loadUser());
  //       }
  //     })
  //   }
  // }
  async uploadProfilePhoto() {
    if(this.data?.id) {
      const id = this.data.id;
      const path = id + '/profile_' + self.crypto.randomUUID().substring(24);

      this.imageCompress.uploadFile().then(async ({image, orientation}) => {
        this.infoToast.message("Uploading...");
        const fullUpload = await this.api.client().storage.from('users').upload(path, FileService.dataURLtoBlob(image), {
          upsert: true
        });
        if(fullUpload.error) {
          this.errorToast.message(fullUpload.error.message);
          return;
        }
        await this.api.client().from('user')
          .update({profile_path: fullUpload.data?.path})
          .eq('id', id);
        console.log(fullUpload)

        this.imageCompress
          .compressFile(image, orientation, 50, 50, 240, 240) // 50% ratio, 50% quality
          .then(async compressedImage => {
            const thumbUpload = await this.api.client().storage.from('users').upload(path+'_thumb', FileService.dataURLtoBlob(compressedImage), {
              upsert: true
            });
            if(thumbUpload.error) {
              this.errorToast.message(thumbUpload.error.message);
              return;
            } else {
              await this.api.client().from('user')
                .update({thumbnail_path: thumbUpload.data?.path})
                .eq('id', id);
              await this.loadUser();
              this.userService.profilePhoto.set(thumbUpload.data?.path)
              this.successToast.message("Uploaded profile photo");
            }
          });
      });
    }
  }

  async updatePassword() {
    if(this.passwordForm.valid) {
      let pw = this.passwordForm.get('password')?.value;
      if(pw) {
        const resp = await this.api.client().auth.updateUser({
          password: pw
        });
        if(resp.data) {
          this.infoToast.message('Password updated')
        }
        if(resp.error) {
          this.errorToast.message(resp.error.message);
        }
      }
    }
  }

  checkPasswords (group: AbstractControl):  ValidationErrors | null { 
    let pass = group.get('password')?.value;
    let confirmPass = group.get('confirmPassword')?.value
    return pass === confirmPass ? null : { notSame: true }
  }
}
