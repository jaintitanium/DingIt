import { Component } from '@angular/core';
import { MenuItemComponent } from "@app/components/menu-item/menu-item.component";
import { SettingsPage } from '../settings.page';
import { TitleService } from '@app/services/title.service';
import { environment } from '@app/../environments/environment';

@Component({
    selector: 'app-main',
    standalone: true,
    templateUrl: './main.page.html',
    styleUrl: './main.page.scss',
    imports: [MenuItemComponent],
})
export class MainSettingsPage {
  isLocal = !environment.production;

  constructor(
    public settings: SettingsPage,
    public titleService: TitleService,
  ) {}

  ngOnInit() {
    this.titleService.setTitle("Settings");
  }
}
