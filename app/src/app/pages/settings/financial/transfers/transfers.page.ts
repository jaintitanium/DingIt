import { CurrencyPipe, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ApiService } from '@app/services/api.service';
import { StripeService } from '@app/services/stripe.service';
import { TitleService } from '@app/services/title.service';
import { UserService } from '@app/services/user.service';
import { Tables } from '@custom-types/supabase';
import { AvatarComponent } from "../../../../components/avatar/avatar.component";
import { PostgrestError, QueryData } from '@supabase/supabase-js';
import { LoadingErrorBlockComponent } from "../../../../components/loading-error-block/loading-error-block.component";

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [
    JsonPipe,
    AvatarComponent,
    CurrencyPipe,
    LoadingErrorBlockComponent
  ],
  templateUrl: './transfers.page.html',
  styleUrl: './transfers.page.scss'
})
export class FinancialTransfersPage {
  transfers: {
    id: string;
    amount: number;
    created_at: number;
  }[] = [];
  reviewQuery;
  reviews: QueryData<typeof this.reviewQuery> = [];
  loaded?: boolean;
  loadedError: PostgrestError | null = null;

  constructor(
    public titleService: TitleService,
    private api: ApiService,
    private userService: UserService,
    private stripe: StripeService,
  ) {
    this.titleService.setTitle("Financial Transactions");
    this.reviewQuery = this.api.client().from('review').select('*,user!inner(*)');
  }

  async ngOnInit() {
    const tranfersResult = await this.stripe.getTransfers();
    this.transfers = tranfersResult?.data?.transfers ?? [];
    const {data,error} = await this.api.client().from('review').select('*,user!inner(*)').in('id', this.transfers.map((x) => x.id));
    if(data) {
      this.reviews = data
    }
    this.loaded = true;
    if(tranfersResult.error) {
      this.loadedError = tranfersResult.error;
    } else if(error) {
      this.loadedError = error;
    }
  }

  groupTransfersByDate() {
    return this.transfers.reduce(function (r, a) {
      let dt = new Date(a.created_at * 1000);
      let date = (dt.getMonth() + 1) + '/' + dt.getDate() + '/' + dt.getFullYear();
      r.set(date, r.get(date) || []);
      r.get(date)?.push(a);
      return r;
    }, new Map<String, { id: string, amount: number, created_at: number; }[]>());
  }
  review(id: string) {
    return this.reviews.find((x) => x.id == id);
  }
}
