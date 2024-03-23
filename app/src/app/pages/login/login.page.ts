import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { ToastComponent } from "../../components/toast/toast.component";

@Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.page.html',
    styleUrl: './login.page.scss',
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        ToastComponent
    ]
})
export class LoginPage {
  loginForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });
  @ViewChild('errorToast') errorToast!: ToastComponent;

  constructor(
    private auth: AuthService,
    private api: ApiService,
  ) {

  }

  async signIn() {
    const { data, error } = await this.api.client().auth.signInWithPassword({
      email: this.loginForm.get('username')?.value,
      password: this.loginForm.get('password')?.value,
    });
    if(error) {
      this.errorToast.message(error.message);
    } else {

    }
  }
}
