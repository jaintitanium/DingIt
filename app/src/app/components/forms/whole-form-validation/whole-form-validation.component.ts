import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormValidation } from '@app/interfaces/form-validation';

@Component({
  selector: 'app-whole-form-validation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './whole-form-validation.component.html',
  styleUrl: './whole-form-validation.component.scss'
})
export class WholeFormValidationComponent {
  @Input('form') form!: FormGroup;
  @Input('validation') validation!: FormValidation[];

}
