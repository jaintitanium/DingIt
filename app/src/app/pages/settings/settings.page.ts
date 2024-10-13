import { Component } from '@angular/core';
import { BackButtonComponent } from "@app/components/back-button/back-button.component";
import { MenuItemComponent } from "@app/components/menu-item/menu-item.component";
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { TitleService } from '@app/services/title.service';
import { slideInAnimation } from '@app/animations';

@Component({
    selector: 'app-settings',
    standalone: true,
    templateUrl: './settings.page.html',
    styleUrl: './settings.page.scss',
    imports: [
      BackButtonComponent, 
      MenuItemComponent,
      RouterOutlet,
    ],
    animations: [
      slideInAnimation
    ],
})
export class SettingsPage {
  constructor(
    public titleService: TitleService,
    private contexts: ChildrenOutletContexts,
  ) {
    
  }
  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'] ?? 'slide';
  }

}
