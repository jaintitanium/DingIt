import { Component } from '@angular/core';
import { LoadingErrorBlockComponent } from "@components/loading-error-block/loading-error-block.component";
import { BackButtonComponent } from "@components/back-button/back-button.component";
import { Tables } from '@custom-types/supabase';
import { PostgrestError } from '@supabase/postgrest-js';
import { ApiService } from '@app/services/api.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { QueryResult } from '@supabase/supabase-js';
import { S3ImgComponent } from "../../../../components/s3-img/s3-img.component";

@Component({
    selector: 'app-menu',
    standalone: true,
    templateUrl: './menu.page.html',
    styleUrl: './menu.page.scss',
    imports: [
      LoadingErrorBlockComponent, 
      BackButtonComponent, 
      S3ImgComponent,
      RouterModule,
    ]
})
export class MenuPage {
  sp?: Tables<'service_provider'> | null;
  error: PostgrestError | null = null;
  id!: string;

  menuQuery;
  menuItems: QueryResult<typeof this.menuQuery> | null = null;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute
  ) {
    this.id = route.snapshot.params['id'];
    this.api.client().from('service_provider')
      .select('*')
      .eq('id', this.id)
      .single()
      .then((resp) => {
        this.sp = resp.data;
        this.error = resp.error;
      });
    this.menuQuery = this.api.client().from('product')
      .select('*,prices:product_price(*)')
      .order('order')
      .eq('service_provider', this.id);
  }

  async ngOnInit() {
    this.menuItems = await this.menuQuery;

  }
  showPhotoColumn(): boolean {
    return this.menuItems?.data?.some(x => x.image_path != null) == true;
  }
  sortPrices(items: Tables<'product_price'>[]) {
    return items.sort((a,b) => Number((<string>a.price).replace(/[^0-9\.]+/g, "")) - Number((<string>b.price).replace(/[^0-9\.]+/g, "")));
  }
}
