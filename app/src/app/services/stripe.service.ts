import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  constructor(
    private api: ApiService
  ) { }

  getOnboardLink() {
    return this.api.client().functions.invoke<string>('stripe', {
      body: {
        action: 'onboard'
      }
    });
  }
}
