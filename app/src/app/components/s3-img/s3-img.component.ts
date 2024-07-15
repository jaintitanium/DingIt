import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ApiService } from '@app/services/api.service';

@Component({
  selector: 'app-s3-img',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './s3-img.component.html',
  styleUrl: './s3-img.component.scss'
})
export class S3ImgComponent {
  @Input('src') src?: string | null;
  @Input('bucket') bucket: string = 'service_providers';
  @Input('bustCache') bustCache: boolean = false;

  public url?: string;
  timestamp?: number;

  constructor(
    private api: ApiService,
  ) {
    if(this.bustCache) {
      this.timestamp = Math.round((new Date().getTime()) / 100);
    }
  }

  async ngOnInit() {
    if(this.src) {
      this.url = (await this.api.client().storage.from(this.bucket).getPublicUrl(this.src)).data.publicUrl + '?' + this.timestamp;
    }
  }

}
