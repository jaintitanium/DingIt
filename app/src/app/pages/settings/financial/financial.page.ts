import { Component } from '@angular/core';
import { ApiService } from '@app/services/api.service';
import { TitleService } from '@app/services/title.service';
import { UserService } from '@app/services/user.service';
import { Tables } from '@custom-types/supabase';
import { LoadingErrorBlockComponent } from "@app/components/loading-error-block/loading-error-block.component";
import { PostgrestError, QueryData } from '@supabase/supabase-js';
import { StripeService } from '@app/services/stripe.service';
import { CurrencyPipe, DatePipe, JsonPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LoadingComponent } from "@app/components/loading/loading.component";

@Component({
  selector: 'app-financial',
  standalone: true,
  imports: [
    LoadingErrorBlockComponent,
    JsonPipe,
    RouterModule,
    LoadingComponent,
    DatePipe,
    CurrencyPipe,
],
  templateUrl: './financial.page.html',
  styleUrl: './financial.page.scss'
})
export class FinancialSettingsPage {
  timeoutDelay: number;
  userQuery;
  user: QueryData<typeof this.userQuery> | null = null;
  userError: PostgrestError | null = null;
  id?: string;
  url: string | null = null;
  urlError: any;

  sub: any | null = null;
  subError: any;

  subLink: string | null = null;
  subLinkLoading = false;
  subLinkError: any;

  constructor(
    public titleService: TitleService,
    private api: ApiService,
    private userService: UserService,
    private stripe: StripeService,
    private route: ActivatedRoute,
  ) {
    this.titleService.setTitle("Financial Settings");
    this.userQuery = this.api.client().from('user').select('*,service_member_user(*),service_provider_user(*)').single();
    this.timeoutDelay = route.snapshot.queryParams['delay'] ?? 0;
  }

  async ngOnInit() {
    setTimeout(async () => {
      this.id = await this.userService.userId();
      if(this.id) {
        const { data, error } = await this.api.client().from('user').select('*,service_member_user(*),service_provider_user(*)').eq('id', this.id).single();
        this.user = data;
        this.userError = error;
        if(!error && data) {
          let resp = await this.stripe.getOnboardLink();
          this.url = resp.data;
          this.urlError = resp.error;
  
          let subResp = await this.stripe.getSubscription();
          this.sub = subResp.data;
          this.subError = subResp.error;
        }
      }
    }, this.timeoutDelay);
  }

  async subButton() {
    this.subLinkLoading = true;
    let resp = await this.stripe.createOrUpdateSubscription();
    console.log(resp)
    if(resp.error) {
      this.subLinkLoading = false;
      this.subLinkError = resp.error;
    }
    this.external(resp.data.url);
    // if(resp.data.object == 'billing_portal.session') {
    //   this.external(resp.data.url);
    // } else if (resp.data.object == 'checkout.session') {
    //   this.external(resp.data.url);
    // }
  }

  external(url: string) {
    window.open(url, "_self")
  }
}
