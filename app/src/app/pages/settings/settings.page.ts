import { Component } from '@angular/core';
import { BackButtonComponent } from "@app/components/back-button/back-button.component";
import { MenuItemComponent } from "@app/components/menu-item/menu-item.component";
import { RouterOutlet } from '@angular/router';
import { TitleService } from '@app/services/title.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    templateUrl: './settings.page.html',
    styleUrl: './settings.page.scss',
    imports: [
      BackButtonComponent, 
      MenuItemComponent,
      RouterOutlet,
    ]
})
export class SettingsPage {
  constructor(
    public titleService: TitleService
  ) {
    
  }

}
