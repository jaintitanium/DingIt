import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { ToastComponent } from "../../components/toast/toast.component";
import { UserService } from '../../services/user.service';
import { BackButtonComponent } from "../../components/back-button/back-button.component";

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
}
