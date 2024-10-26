import { Component } from '@angular/core';
import { ApiService } from '@app/services/api.service';
import { LoadingErrorBlockComponent } from "../loading-error-block/loading-error-block.component";
import { PostgrestError, QueryData } from '@supabase/supabase-js';
import { RatingComponent } from "../rating/rating.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-monthly-spotlight',
  standalone: true,
  imports: [
    LoadingErrorBlockComponent, 
    RatingComponent,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './monthly-spotlight.component.html',
  styleUrl: './monthly-spotlight.component.scss'
})
export class MonthlySpotlightComponent {
  query;
  spotlights: QueryData<typeof this.query> | null = null;
  error: PostgrestError | null = null;

  constructor(
    private api: ApiService,
  ) {
    this.query = api.client().from('monthly_spotlight')
      .select('*,service_provider(*),service_provider_member(*,service_provider(display_name,city,state),member_rating,service_member_user(user(*)))')
      .order('order');
  }

  async ngOnInit() {
    const {data, error} = await this.query;
    this.spotlights = data;
    this.error = error;
  }

  getHeaderPath(spotlight: ArrElement<typeof this.spotlights>) {
    if(spotlight.service_provider != null) {
      return (
        // spotlight.service_provider.header_thumbnail_path != null || 
        spotlight.service_provider.header_image_path != null) ? 
      'url(' + this.api.client().storage.from('service_providers').getPublicUrl(
        // spotlight.service_provider.header_thumbnail_path ?? 
        spotlight.service_provider.header_image_path ?? '').data.publicUrl+')' : 
      '';
    } else if(spotlight.service_provider_member != null) {
      return (
        // spotlight.service_provider_member.service_member_user?.user?.thumbnail_path != null || 
        spotlight.service_provider_member.service_member_user?.user?.profile_path != null) ? 
      'url(' + this.api.client().storage.from('users').getPublicUrl(
        // spotlight.service_provider_member.service_member_user?.user?.thumbnail_path ??
        spotlight.service_provider_member.service_member_user?.user?.profile_path ?? '').data.publicUrl+')' : 
      '';
    } else {
      return '';
    }
  }
}

type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[]
  ? ElementType
  : never;
