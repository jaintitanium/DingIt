import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.scss'
})
export class BackButtonComponent {
  @Input('size') size: number = 24;
  @Input('color') color: string = 'primary';
  constructor(private _location: Location) 
  {}

  backClicked() {
    this._location.back();
  }
}
