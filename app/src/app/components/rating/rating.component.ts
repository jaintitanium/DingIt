import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.scss'
})
export class RatingComponent {
  @Input('value') value: number | null = null;
  @Input('allowInput') allowInput = false;
  private gradation = 0.5;
  public ratings = Array.from({length: 5}, (_, i) => i + 1);

  show(input: number): boolean {
    let v = this.value ?? 0;
    return v > input - (this.gradation / 2) && v < input + (this.gradation / 2);
  }
}
