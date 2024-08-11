import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FormValidation } from '@app/interfaces/form-validation';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true
    }
  ],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.scss'
})
export class RatingComponent implements ControlValueAccessor {
  @Input('value')
  get value() {
    return this._value;
  }
  set value(val) {
    console.log(val)
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }
  private _value: number | null = null;
  @Input('allowInput') allowInput = false;
  @Input('size') size: 'lg' | 'md' | 'sm' = 'sm';
  @Input('color') color: 'primary' | 'base-100' = 'primary';

  public nameId: string;

  constructor() {
    this.nameId = 'rating-' + this.randomString(8);
  }
  
  randomString(length: number, chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }
  
  onChange = (rating: number | null) => {};
  onTouched: any = () => {};  
  
  registerOnChange(fn: (_: number | null) => void) {
    console.log("registerOnChange", fn)
    this.onChange = fn;
  }
  writeValue(value: number | null) {
    this.value = value;
  }
  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.allowInput = !isDisabled;
  }

  private gradation = 0.5;
  public ratings = Array.from({length: 5}, (_, i) => i + 1);

  show(input: number): boolean {
    let v = this._value ?? 0;
    return v > input - (this.gradation / 2) && v <= input + (this.gradation / 2);
  }
}
