import { Component } from '@angular/core';
import { ApiService } from '@app/services/api.service';
import { TitleService } from '@app/services/title.service';
import { UserService } from '@app/services/user.service';
import { Tables } from '@custom-types/supabase';
import { LoadingErrorBlockComponent } from "../../../components/loading-error-block/loading-error-block.component";
import { PostgrestError } from '@supabase/supabase-js';
import { PostgrestResponseFailure } from '@supabase/postgrest-js';
import { StripeService } from '@app/services/stripe.service';
import { JsonPipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-financial',
  standalone: true,
  imports: [
    LoadingErrorBlockComponent,
    JsonPipe,
    RouterModule,
  ],
  templateUrl: './financial.page.html',
  styleUrl: './financial.page.scss'
})
export class FinancialSettingsPage {
  serviceUser: Tables<'service_member_user'>[] | null = null;
  serviceUserError: PostgrestError | null = null;
  id?: string;
  url: string | null = null;
  urlError: any;

  constructor(
    public titleService: TitleService,
    private api: ApiService,
    private userService: UserService,
    private stripe: StripeService,
  ) {
    this.titleService.setTitle("Financial Settings");
    
  }

  async ngOnInit() {
    this.id = await this.userService.userId();
    if(this.id) {
      const { data, error } = await this.api.client().from('service_member_user').select().eq('id', this.id);
      this.serviceUser = data;
      this.serviceUserError = error;
      if(!error && data.length > 0) {
        let resp = await this.stripe.getOnboardLink();
        this.url = resp.data;
        this.urlError = resp.error;
      }
    }
  }

  external(url: string) {
    window.open(url)
  }
}
