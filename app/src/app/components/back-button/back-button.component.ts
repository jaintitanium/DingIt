import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { AppComponent } from '@app/app.component';

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
  
  constructor(
    private _location: Location,
    private router: Router,
    private app: AppComponent,
  ) { }

  backClicked() {
    console.log(this.app.getPreviousUrl())
    if (!['/loading', '/complete-profile'].includes(this.app.getPreviousUrl())) {
      this._location.back()
    } else {
      this.router.navigate(['/'])
    }
  }
}
