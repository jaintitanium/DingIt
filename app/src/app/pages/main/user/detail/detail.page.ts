import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { PostgrestError, QueryData } from '@supabase/supabase-js';
import { LoadingErrorBlockComponent } from "../../../../components/loading-error-block/loading-error-block.component";
import { BackButtonComponent } from "../../../../components/back-button/back-button.component";
import { AvatarComponent } from "../../../../components/avatar/avatar.component";
import { ReviewBadgeComponent } from "../../../../components/review-badge/review-badge.component";
import { DecimalPipe } from '@angular/common';
import { S3ImgComponent } from "../../../../components/s3-img/s3-img.component";
import { RatingComponent } from "../../../../components/rating/rating.component";

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    LoadingErrorBlockComponent,
    BackButtonComponent,
    AvatarComponent,
    DecimalPipe,
    S3ImgComponent,
    RouterModule,
    RatingComponent
],
  templateUrl: './detail.page.html',
  styleUrl: './detail.page.scss'
})
export class UserDetailPage {
  id: string;

  userQuery;
  user: QueryData<typeof this.userQuery> | null = null;
  userError: PostgrestError | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
  ) {
    this.id = route.snapshot.params['id'];
    this.userQuery = this.api.client().from('user').select('*,review(*,service_provider(*),review_service_member(rating))').eq('id', this.id).single();
  }

  async ngOnInit() {
    const {data,error} = await this.userQuery;
    this.user = data;
    this.userError = error;
  }

  countReviewsByRating(rating: number): number {
    if(this.user) {
      return this.user.review.filter((x) => x.rating <= (rating + 0.5) && x.rating > (rating - 0.5)).length;
    } else {
      return 0;
    }
  }
  averageRatings(reviews: {rating: number}[]): number {
    return reviews.reduce((prev, curr) => {
      return prev = prev + curr.rating;
    }, 0) / reviews.length;
  }

}
