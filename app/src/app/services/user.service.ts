import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private api: ApiService) { }

  async getUser() {
    const { data: { session } } = await this.api.client().auth.getSession();
    return session?.user;
  }
  async userId() {
    let session = await this.api.client().auth.getSession();
    return session?.data?.session?.user.id;
  }
  async isLoggedIn() {
    let id = await this.userId();
    return id != undefined;
  }
}
