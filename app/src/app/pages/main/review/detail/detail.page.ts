import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { PostgrestError, QueryData } from '@supabase/supabase-js';
import { LoadingErrorBlockComponent } from "../../../../components/loading-error-block/loading-error-block.component";
import { BackButtonComponent } from "../../../../components/back-button/back-button.component";
import { AvatarComponent } from "../../../../components/avatar/avatar.component";
import { RatingComponent } from "../../../../components/rating/rating.component";
import { S3ImgComponent } from "../../../../components/s3-img/s3-img.component";

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    LoadingErrorBlockComponent,
    BackButtonComponent,
    AvatarComponent,
    RatingComponent,
    S3ImgComponent
],
  templateUrl: './detail.page.html',
  styleUrl: './detail.page.scss'
})
export class ReviewDetailPage {
  private id: string;
  public query;
  public data?: QueryData<typeof this.query> | null = null;
  public error: PostgrestError | null = null;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
  ) {
    this.id = this.route.snapshot.params['id'];
    this.query = this.api.client().from('review')
      .select('*,\
        user(*),\
        service_provider(*),\
        review_product(*,product(*)),\
        review_service_member(*,service_provider_member(service_member_user(*,user(*))))')
      .eq('id', this.id).single();
  }

  async ngOnInit() {
    const {data, error} = await this.query;
    this.data = data;
    this.error = error;
  }

}
