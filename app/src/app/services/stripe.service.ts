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
  getCheckoutSessionForReview(review: string) {
    return this.api.client().functions.invoke<string>('stripe', {
      body: {
        action: 'tip',
        review: review,
      }
    });
  }
  getTransfers(starting_after?: string, limit?: number) {
    return this.api.client().functions.invoke<{ transfers: { id: string, amount: number, created_at: number }[], has_more: boolean }>('stripe', {
      body: {
        action: 'getTransfers',
        starting_after: starting_after,
        limit: limit,
      }
    });
  }
}
