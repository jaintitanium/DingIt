import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { UserService } from '../../../services/user.service';
import { ToastComponent } from '../../../components/toast/toast.component';
import { Tables } from '../../../../types/supabase';
import { LoadingComponent } from "../../../components/loading/loading.component";
import { Router } from '@angular/router';
import { LoadingErrorBlockComponent } from "../../../components/loading-error-block/loading-error-block.component";
import { PostgrestError } from '@supabase/supabase-js';

@Component({
    selector: 'app-profile',
    standalone: true,
    templateUrl: './profile.page.html',
    styleUrl: './profile.page.scss',
    imports: [
        CommonModule,
        LoadingComponent,
        LoadingErrorBlockComponent
    ]
})
export class ProfilePage {
  @ViewChild('errorToast') errorToast!: ToastComponent;
  data?: Tables<'user'>;
  error: PostgrestError | null = null;

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
      const {data, error} = await this.api.client().from('user')
        .select('*')
        .eq('id', id)
        .single();
      this.error = error;
      if(data) {
        this.data = data;
      }
    }
  }

  signOut() {
    this.usr.isLoggedIn.set(false);
    this.api.supabase.auth.signOut();
    this.router.navigate(['']);
  }
}
