import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormValidation } from '@app/interfaces/form-validation';

@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './select-field.component.html',
  styleUrl: './select-field.component.scss'
})
export class SelectFieldComponent {
  @Input('name') name!: string;
  @Input('form') form!: FormGroup;
  @Input('validation') validation!: FormValidation[];
  @Input('label') label?: string;
  @Input('placeholder') placeholder?: string;
  @Input('classes') classes?: string;
  // @Input('prompt') prompt?: string;
  @Input('options') options!: {value: string | number, label: string}[];

}
