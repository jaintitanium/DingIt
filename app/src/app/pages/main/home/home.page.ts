import { Component } from '@angular/core';
import { LoadingErrorBlockComponent } from "@app/components/loading-error-block/loading-error-block.component";
import { ApiService } from '@app/services/api.service';
import { Database, Tables } from '@custom-types/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { Router, RouterModule } from '@angular/router';
import { RatingComponent } from "../../../components/rating/rating.component";
import { LocationHelperService } from '@app/services/location-helper.service';
import { S3ImgComponent } from "../../../components/s3-img/s3-img.component";
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MonthlySpotlightComponent } from "../../../components/monthly-spotlight/monthly-spotlight.component";

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  imports: [
    LoadingErrorBlockComponent,
    RouterModule,
    RatingComponent,
    S3ImgComponent,
    CommonModule,
    DecimalPipe,
    ReactiveFormsModule,
    MonthlySpotlightComponent
  ]
})
export class HomePage {
  list?: Tables<'service_provider'>[];
  listError: PostgrestError | null = null;
  hotspots?: Database['public']['Functions']['get_hotspots']['Returns'];

  searchForm = new FormGroup({
    input: new FormControl<string | null>(null),
  })
  
  constructor(
    private api: ApiService,
    private location: LocationHelperService,
    private router: Router,
  ) {

  }
  async ngOnInit() {
    const {data, error} = await this.api.client().from('service_provider')
      .select('*,provider_rating')
      .gt('provider_rating', 0)
      .order('provider_rating', { ascending: false })
      .limit(12);
    this.listError = error;
    if(data) {
      this.list = data;
    }
    this.hotspots = await this.location.getLocalHotspots();
  }

  getImageUrl(path: string | null, bucket = 'service_providers') {
    return path ? this.api.client().storage.from(bucket)
      .getPublicUrl(path)
      .data
      .publicUrl : '';
  }

  search() {
    this.router.navigate(['search'], {queryParams: { search_text: this.searchForm.get('input')?.value}})
  }
}
