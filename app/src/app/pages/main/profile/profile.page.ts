import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { UserService } from '../../../services/user.service';
import { ToastComponent } from '../../../components/toast/toast.component';
import { Tables } from '../../../../types/supabase';
import { LoadingComponent } from "../../../components/loading/loading.component";
import { Router } from '@angular/router';

@Component({
    selector: 'app-profile',
    standalone: true,
    templateUrl: './profile.page.html',
    styleUrl: './profile.page.scss',
    imports: [
        CommonModule,
        LoadingComponent
    ]
})
export class ProfilePage {
  @ViewChild('errorToast') errorToast!: ToastComponent;
  data?: Tables<'user'>;

  constructor(
    private usr: UserService,
    private api: ApiService,
    private router: Router,
  ) {
    this.loadUser();
  }

  async loadUser() {
    let id = await this.usr.userId();
    if(id) {
      const {data, error} = await this.api.client().from('user').select('*').eq('id', id);
      if(error) {
        this.errorToast.message(error.message);
      } else if(data && data[0]) {
        this.data = data[0];
      }
    }
  }

  signOut() {
    this.usr.isLoggedIn.set(false);
    this.api.supabase.auth.signOut();
    this.router.navigate(['']);
  }
}
