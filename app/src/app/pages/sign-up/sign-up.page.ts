import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { TextFieldComponent } from "../../components/forms/text-field/text-field.component";

@Component({
    selector: 'app-sign-up',
    standalone: true,
    templateUrl: './sign-up.page.html',
    styleUrl: './sign-up.page.scss',
    imports: [
        ReactiveFormsModule,
        TextFieldComponent
    ]
})
export class SignUpPage {
  signupForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: this.checkPasswords });

  constructor(
    private api: ApiService
  ) {}

  signup() {

  }

  checkPasswords (group: AbstractControl):  ValidationErrors | null { 
    let pass = group.get('password')?.value;
    let confirmPass = group.get('confirmPassword')?.value
    return pass === confirmPass ? null : { notSame: true }
  }
}
