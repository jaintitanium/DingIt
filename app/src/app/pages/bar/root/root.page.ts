import { Component } from '@angular/core';
import { MessagesIndicatorComponent } from "../../../components/messages-indicator/messages-indicator.component";
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './root.page.html',
    styleUrl: './root.page.scss',
    imports: [ 
      RouterOutlet, 
      MessagesIndicatorComponent 
    ]
})
export class RootPage {

}
