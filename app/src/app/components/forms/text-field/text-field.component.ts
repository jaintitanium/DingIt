import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormValidation } from '../../../interfaces/form-validation';
import { NgxCurrencyDirective } from "ngx-currency";

@Component({
  selector: 'app-text-field',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxCurrencyDirective,
  ],
  templateUrl: './text-field.component.html',
  styleUrl: './text-field.component.scss'
})
export class TextFieldComponent {
  @Input('name') name!: string;
  @Input('form') form!: FormGroup;
  @Input('validation') validation!: FormValidation[];
  @Input('type') type: string = 'text';
  @Input('label') label?: string;
  @Input('placeholder') placeholder?: string;
  @Input('classes') classes?: string;

}
