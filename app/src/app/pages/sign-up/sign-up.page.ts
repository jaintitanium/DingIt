import { Component, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { TextFieldComponent } from "../../components/forms/text-field/text-field.component";
import { environment } from '../../../environments/environment';
import { ToastComponent } from "../../components/toast/toast.component";
import { WholeFormValidationComponent } from "../../components/forms/whole-form-validation/whole-form-validation.component";
import { Router } from '@angular/router';
import { BackButtonComponent } from "../../components/back-button/back-button.component";

@Component({
    selector: 'app-sign-up',
    standalone: true,
    templateUrl: './sign-up.page.html',
    styleUrl: './sign-up.page.scss',
    imports: [
        ReactiveFormsModule,
        TextFieldComponent,
        ToastComponent,
        WholeFormValidationComponent,
        BackButtonComponent
    ]
})
export class SignUpPage {
  @ViewChild('errorToast') errorToast!: ToastComponent;
  @ViewChild('infoToast') infoToast!: ToastComponent;
  signupForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: this.checkPasswords });

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  async signup() {
    if(this.signupForm.valid) {
      const { data, error } = await this.api.client().auth.signUp({
        email: this.signupForm.get('email')?.value,
        password: this.signupForm.get('password')?.value,
        options: {
          emailRedirectTo: environment.appUrl + 'complete-profile',
        },
      });
      if(error) {
        this.errorToast.message(error.message);
      } else {
        this.infoToast.message('Please check your email to verify your account');
        setTimeout(() => {
          this.router.navigate(['']);
        }, 5000);
      }
    } else {
      this.signupForm.markAllAsTouched();
    }
  }

  checkPasswords (group: AbstractControl):  ValidationErrors | null { 
    let pass = group.get('password')?.value;
    let confirmPass = group.get('confirmPassword')?.value
    return pass === confirmPass ? null : { notSame: true }
  }
}
