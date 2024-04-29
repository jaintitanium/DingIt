import { Component } from '@angular/core';
import { TitleService } from '@app/services/title.service';
import { UserService } from '@app/services/user.service';
import { Tables } from '@custom-types/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { MenuItemComponent } from "../../../components/menu-item/menu-item.component";
import { RouterModule } from '@angular/router';
import { ApiService } from '@app/services/api.service';

@Component({
    selector: 'app-service-provider',
    standalone: true,
    templateUrl: './service-provider.page.html',
    styleUrl: './service-provider.page.scss',
    imports: [
      MenuItemComponent,
      RouterModule,
    ]
})
export class ServiceProviderPage {
  query;

  data?: Tables<'service_provider'>[] | null;
  error: PostgrestError | null = null;
  constructor(
    public titleService: TitleService,
    private user: UserService,
    private api: ApiService
  ) {

    this.query = this.api.client()
      .from('service_provider')
      .select('*,service_provider_hours(*)');
  }

  ngOnInit() {
    this.titleService.setTitle("Service Providers");
    this.user.getUser().then(async (user) => {
      if(user) {
        const {data, error} = await this.query.eq('owner', user.id);
        this.data = data;
        this.error = error;
      }
    });
    
  }
}
