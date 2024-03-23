import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(150, style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate(250, style({ opacity: 0 }))
      ])
    ])
  ],
})
export class ToastComponent {
  private _message: string | null = null;
  @Input('message') 
  public get message() {
    return this._message;
  }
  public set message(m: string | null) {
    if(m) {
      this._message = m;
      setTimeout(() => {
        this._message = null;
      }, this.timeout);
    }
  }
  @Input('type') type!: string;
  @Input('timeout') timeout: number = 3000;


}
