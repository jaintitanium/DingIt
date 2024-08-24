import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { PostgrestError, QueryData } from '@supabase/supabase-js';
import { LoadingErrorBlockComponent } from "@app/components/loading-error-block/loading-error-block.component";
import { ReviewBadgeComponent } from "@app/components/review-badge/review-badge.component";
import { BackButtonComponent } from "@app/components/back-button/back-button.component";

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    LoadingErrorBlockComponent, 
    ReviewBadgeComponent, 
    BackButtonComponent,
    RouterModule,
  ],
  templateUrl: './reviews.page.html',
  styleUrl: './reviews.page.scss'
})
export class ServiceProviderReviewsPage {
  id: string;
  query;
  sp: QueryData<typeof this.query> | null = null;
  error: PostgrestError | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
  ) {
    this.id = route.snapshot.params['id'];
    this.query = this.api.client()
      .from('service_provider')
      .select('*,\
        reviews:review(*,user(*),review_tip_total)')
      .eq('id', this.id)
      .order('rating', { referencedTable: 'review', ascending: false })
      .single();
  }

  async ngOnInit() {
    const {data, error} = await this.query;
    this.sp = data;
    this.error = error;
  }

}
