import { Injectable, computed, signal } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  profileCompleted = signal(false);
  private _redirectUrl: string | null = null;
  isLoggedIn = signal(false);
  profilePhoto = signal<string | null>(null);

  constructor(private api: ApiService) {
    this.userId();
    this.checkProfileComplete();
  }

  async getUser() {
    const { data: { session } } = await this.api.client().auth.getSession();
    return session?.user;
  }
  async userId() {
    let session = await this.api.client().auth.getSession();
    let id = session?.data?.session?.user.id;
    this.isLoggedIn.set(id != undefined);
    return id;
  }
  async checkProfileComplete() {
    if(this.profileCompleted() == false) {
      let id = await this.userId();
      if(id) {
        const { data, error } = await this.api.client()
          .from('user')
          .select('*')
          .eq('id', id)
          .single();
        if(data && data.name) {
          this.profileCompleted.set(true);
          this.profilePhoto.set(data.thumbnail_path ?? data.profile_path);
        }
      }
    }
    return this.profileCompleted();
  }

  getRedirectUrl() {
    return this._redirectUrl;
  }
  setRedirectUrl(url: string) {
    this._redirectUrl = url;
  }
  clearRedirectUrl() {
    this._redirectUrl = null;
  }
}
