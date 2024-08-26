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
  @ViewChild('errorToast') errorToast!: ToastComponent;
  @ViewChild('infoToast') infoToast!: ToastComponent;
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
    this.router.navigate(['']);
  }

  uploadProfilePhoto(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      this.api.client().storage.from('users').upload(this.data?.id + '/profile.png', fileList[0], {
        upsert: true
      }).then((data) => {
        if(this.data) {
          this.api.client().from('user')
            .update({profile_path: data.data?.path})
            .eq('id', this.data.id)
            .then(() => this.loadUser());
        }
      })
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
