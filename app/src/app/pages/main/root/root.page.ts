import { Component } from '@angular/core';
import { MessagesIndicatorComponent } from "@app/components/messages-indicator/messages-indicator.component";
import { RouterModule, RouterOutlet } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { AvatarComponent } from "../../../components/avatar/avatar.component";
import { UserService } from '@app/services/user.service';

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
]
})
export class RootPage {
  avatarUrl: string | null = null;

  constructor(
    private api: ApiService,
    private userService: UserService,
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
}
