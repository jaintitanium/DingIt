import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { CommonModule } from '@angular/common';
import { ToastComponent } from "@app/components/toast/toast.component";
import { UserService } from '@app/services/user.service';
import { BackButtonComponent } from "@app/components/back-button/back-button.component";
import { environment } from 'environments/environment';

@Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.page.html',
    styleUrl: './login.page.scss',
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        ToastComponent,
        BackButtonComponent
    ]
})
export class LoginPage {
  loginForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });
  @ViewChild('errorToast') errorToast!: ToastComponent;
  @ViewChild('infoToast') infoToast!: ToastComponent;

  constructor(
    private api: ApiService,
    private usr: UserService,
    private router: Router,
  ) {

  }

  async signIn() {
    if(this.loginForm.valid) {
      const { data, error } = await this.api.client().auth.signInWithPassword({
        email: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value,
      });
      if(error) {
        this.errorToast.message(error.message);
      } else {
        this.usr.isLoggedIn.set(true);
        this.usr.getUser().then((user) => {
          if(user)
          this.api.client().from('user').select('*').eq('id', user?.id).single().then((user) => {
            this.usr.profilePhoto.set(user.data?.thumbnail_path ?? user.data?.profile_path ?? null)
          })
        })
        let url = this.usr.getRedirectUrl();
        if(url) {
          this.usr.clearRedirectUrl();
          this.router.navigateByUrl(url);
        } else {
          this.router.navigate(['']);
        }
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  async resetPassword() {
    let email = this.loginForm.get('username')?.value;
    if(email) {
      const {data,error} = await this.api.client().auth.resetPasswordForEmail(email, {
        redirectTo: environment.appUrl + '/redirect'
      });
      if(data) {
        this.infoToast.message('Password reset email sent to ' + email);
      }
      if(error) {
        this.errorToast.message(error.message);
      }
    } else {
      this.infoToast.message('Enter your username, then press Reset Password');
    }
  }
}
