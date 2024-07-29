import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormValidation } from '@app/interfaces/form-validation';

@Component({
  selector: 'app-field-validation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './field-validation.component.html',
  styleUrl: './field-validation.component.scss'
})
export class FieldValidationComponent {
  @Input('name') name!: string;
  @Input('form') form!: FormGroup;
  @Input('validation') validation?: FormValidation[];

}
