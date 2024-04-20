import { Component, Input } from '@angular/core';
import { ApiService } from '@app/services/api.service';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {
  @Input('path') path: string | null = null;
  @Input('force') force: boolean = false;

  constructor(
    private api: ApiService
  ) {}

  getPublicUrl(url: string | null) {
    if(!url) return '';
    return this.api.client().storage.from('users')
      .getPublicUrl(url)
      .data
      .publicUrl;
  }
  forceUpdate(force: boolean) {
    return force ? Math.round((new Date().getTime()) / 100) : '';
  }
}
