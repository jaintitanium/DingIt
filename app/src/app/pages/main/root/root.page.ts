import { Component } from '@angular/core';
import { MessagesIndicatorComponent } from "@app/components/messages-indicator/messages-indicator.component";
import { ChildrenOutletContexts, RouterModule, RouterOutlet } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { AvatarComponent } from "../../../components/avatar/avatar.component";
import { UserService } from '@app/services/user.service';
import { slideInAnimation } from '@app/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './root.page.html',
  styleUrl: './root.page.scss',
  imports: [
    RouterOutlet,
    RouterModule,
    MessagesIndicatorComponent,
    AvatarComponent
  ],
  animations: [
    slideInAnimation
  ],
})
export class RootPage {
  avatarUrl: string | null = null;

  constructor(
    private api: ApiService,
    private userService: UserService,
    private contexts: ChildrenOutletContexts,
  ) {

  }

  async ngOnInit() {
    const id = await this.userService.userId();
    if(id) {
      const {data,error} = await this.api.client().from('user').select().eq('id', id).single();
      if(data) {
        this.avatarUrl = data.profile_path
      }
    }
  }
  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'] ?? 'slide';
  }
}
