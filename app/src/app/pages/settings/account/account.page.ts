import { Component } from '@angular/core';
import { SettingsPage } from '../settings.page';
import { TitleService } from '@app/services/title.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [],
  templateUrl: './account.page.html',
  styleUrl: './account.page.scss'
})
export class AccountSettingsPage {
  constructor(
    public settings: SettingsPage,
    public titleService: TitleService,
  ) {}

  ngOnInit() {
    this.titleService.setTitle("Account Settings");
  }
}
