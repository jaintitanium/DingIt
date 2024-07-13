import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { LoadingErrorBlockComponent } from "../../../components/loading-error-block/loading-error-block.component";
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from "../../../components/back-button/back-button.component";

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [
    CommonModule,
    BackButtonComponent
],
  templateUrl: './view.page.html',
  styleUrl: './view.page.scss'
})
export class ImageViewPage {
  id: string;
  type: string;

  title?: string;
  subtitle?: string | null;
  imageUrl?: string | null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
  ) {
    this.id = route.snapshot.params['id'];
    this.type = route.snapshot.params['type'];
    if(this.type == 'product') {
      this.api.client().from('product').select().eq('id', this.id).single().then((product) => {
        if(product.data) {
          this.title = product.data.display_name;
          this.subtitle = product.data.description;
          this.imageUrl = this.api.client().storage.from('service_providers')
            .getPublicUrl(product.data.image_path ?? '')
            .data
            .publicUrl;
        }
      })
    }
  }
}
