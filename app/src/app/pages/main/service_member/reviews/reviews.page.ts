import { Component } from '@angular/core';
import { BackButtonComponent } from "../../../../components/back-button/back-button.component";
import { LoadingErrorBlockComponent } from "../../../../components/loading-error-block/loading-error-block.component";
import { ReviewBadgeComponent } from "../../../../components/review-badge/review-badge.component";
import { PostgrestError, QueryData } from '@supabase/supabase-js';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@app/services/api.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    BackButtonComponent, 
    LoadingErrorBlockComponent, 
    ReviewBadgeComponent
  ],
  templateUrl: './reviews.page.html',
  styleUrl: './reviews.page.scss'
})
export class ServiceMemberReviewsPage {
  id: string;
  query;
  spm: QueryData<typeof this.query> | null = null;
  error: PostgrestError | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
  ) {
    this.id = route.snapshot.params['id'];
    this.query = this.api.client()
      .from('service_provider_member')
      .select('*,\
        service_member_user(user(*)),\
        service_provider(*,service_provider_member(id)),\
        reviews:review_service_member(*,parent:review!inner(*,user(*)))')
      .eq('id', this.id)
      .order('rating', { referencedTable: 'review_service_member', ascending: false })
      .single();
  }

  async ngOnInit() {
    const {data, error} = await this.query;
    this.spm = data;
    this.error = error;
  }

}
