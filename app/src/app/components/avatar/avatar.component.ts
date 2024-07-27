import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ApiService } from '@app/services/api.service';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {
  @Input('path') path: string | null | undefined = null;
  @Input('force') force: boolean = false;
  @Input('size') size: 'lg' | 'md' | 'sm' = 'lg';
  @Input('shape') shape: 'circle' | 'square' = 'circle';

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
