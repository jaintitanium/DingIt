import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { TitleService } from '@app/services/title.service';
import { PostgrestError, QueryData } from '@supabase/supabase-js';
import { LoadingErrorBlockComponent } from "../../../../components/loading-error-block/loading-error-block.component";
import { BackButtonComponent } from "../../../../components/back-button/back-button.component";
import { AvatarComponent } from "../../../../components/avatar/avatar.component";
import { DecimalPipe } from '@angular/common';
import { Tables } from '@custom-types/supabase';
import { S3ImgComponent } from "../../../../components/s3-img/s3-img.component";
import { LocationHelperService } from '@app/services/location-helper.service';
import { RatingComponent } from "../../../../components/rating/rating.component";
import { ReviewBadgeComponent } from "../../../../components/review-badge/review-badge.component";

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    LoadingErrorBlockComponent,
    BackButtonComponent,
    AvatarComponent,
    DecimalPipe,
    RouterModule,
    S3ImgComponent,
    RatingComponent,
    ReviewBadgeComponent
],
  templateUrl: './detail.page.html',
  styleUrl: './detail.page.scss'
})
export class ServiceMemberDetailPage {
  id: string;
  query;
  spm: QueryData<typeof this.query> | null = null;
  error: PostgrestError | null = null;
  reviews: reviewWithParent[] = [];
  distance?: number;
  highestReview = signal<reviewWithParent | null>(null);
  lowestReview = signal<reviewWithParent | null>(null);

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public title: TitleService,
    private location: LocationHelperService,
  ) {
    this.id = route.snapshot.params['id'];
    this.query = this.api.client()
      .from('service_provider_member')
      .select('*,\
        member_rating,\
        service_member_user(user(*)),\
        service_provider(*,service_provider_member(id)),\
        reviews:review_service_member(*,parent:review!inner(*,user(*)))')
      .eq('id', this.id)
      .single();
  }
  async ngOnInit() {
    const {data, error} = await this.query;
    this.spm = data;
    this.error = error;
    if(data) {
      this.title.setTitle(data.service_member_user?.user?.name + ' | ' + data.service_provider?.display_name);
      this.reviews = data.reviews;
      if(data.reviews.length >= 1) {
        console.log(data.reviews.sort((a,b) => b.rating - a.rating)[0])
        this.highestReview.set(data.reviews.sort((a,b) => b.rating - a.rating)[0]);
      }
      if(data.reviews.length >= 2) {
        console.log(data.reviews.sort((a,b) => a.rating - b.rating)[0])
        this.lowestReview.set(data.reviews.sort((a,b) => a.rating - b.rating)[0]);
      }
      this.location.getDistanceToServiceProvider(data.service_provider_id, (distance: number) => {
        this.distance = distance;
      }, (err) => {
        
      });
    } else {
      this.title.setTitle("");
    }
  }

  countReviewsByRating(rating: number): number {
    return this.reviews.filter((x) => x.rating <= (rating + 0.5) && x.rating > (rating - 0.5)).length;
  }

}

interface reviewWithParent extends Tables<'review_service_member'> {
  parent: reviewWithUser
}
interface reviewWithUser extends Tables<'review'> {
  user: Tables<'user'> | null
}