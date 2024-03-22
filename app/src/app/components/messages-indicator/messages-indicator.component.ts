import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-messages-indicator',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './messages-indicator.component.html',
  styleUrl: './messages-indicator.component.scss'
})
export class MessagesIndicatorComponent {
  @Input('count') count = 0;

}
