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
  get value() {
    return this._value;
  }
  set value(val) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }
  @Input('value') _value: number | null = null;
  @Input('allowInput') allowInput = false;
  @Input('size') size: 'lg' | 'md' | 'sm' = 'sm';

  ngOnInit() {
    
  }
  
  onChange = (rating: number | null) => {};
  onTouched: any = () => {};  
  
  registerOnChange(fn: (_: number | null) => void) {
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
    let v = this.value ?? 0;
    return v > input - (this.gradation / 2) && v <= input + (this.gradation / 2);
  }
}
