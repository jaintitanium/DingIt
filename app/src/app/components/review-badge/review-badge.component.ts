import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Tables } from '@custom-types/supabase';
import { AvatarComponent } from "@app/components/avatar/avatar.component";
import { RatingComponent } from "@app/components/rating/rating.component";

@Component({
  selector: 'app-review-badge',
  standalone: true,
  imports: [
    RouterModule,
    AvatarComponent,
    RatingComponent
],
  templateUrl: './review-badge.component.html',
  styleUrl: './review-badge.component.scss'
})
export class ReviewBadgeComponent {
  @Input('review') review!: {description: string, rating: number, review_tip_total: number | null};
  @Input('owner') owner!: Tables<'user'>;
  @Input('detailId') detailId!: string;
}
