import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { PostgrestError, QueryData } from '@supabase/supabase-js';
import { BackButtonComponent } from "@app/components/back-button/back-button.component";
import { LoadingErrorBlockComponent } from "@app/components/loading-error-block/loading-error-block.component";
import { ReviewBadgeComponent } from "@app/components/review-badge/review-badge.component";
import { ServiceMemberBadgeComponent } from "@app/components/service-member-badge/service-member-badge.component";

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [
    BackButtonComponent,
    LoadingErrorBlockComponent,
    ReviewBadgeComponent,
    ServiceMemberBadgeComponent
],
  templateUrl: './team.page.html',
  styleUrl: './team.page.scss'
})
export class ServiceProviderTeamPage {
  id: string;
  query;
  sp: QueryData<typeof this.query> | null = null;
  error: PostgrestError | null = null;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
  ) {
    this.id = route.snapshot.params['id'];
    this.query = this.api.client()
      .from('service_provider')
      .select('*,\
        team:service_provider_member(*,member_rating,service_member_user(user(*)))')
      .eq('id', this.id)
      .order('member_rating', { referencedTable: 'service_provider_member', ascending: false })
      .single();
  }

  async ngOnInit() {
    const {data, error} = await this.query;
    this.sp = data;
    this.error = error;
  }

}
