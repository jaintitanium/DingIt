import { Component, Input } from '@angular/core';
import { AvatarComponent } from "../avatar/avatar.component";
import { RatingComponent } from "../rating/rating.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-service-member-badge',
  standalone: true,
  imports: [
    AvatarComponent, 
    RatingComponent,
    RouterModule,
  ],
  templateUrl: './service-member-badge.component.html',
  styleUrl: './service-member-badge.component.scss'
})
export class ServiceMemberBadgeComponent {
  @Input('member') member!: { id: string, member_rating: number | null, service_member_user: null | { user: null | { name: string, profile_path: null | string }}};

}
