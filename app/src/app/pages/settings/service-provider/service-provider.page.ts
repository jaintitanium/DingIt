import { Component } from '@angular/core';
import { TitleService } from '@app/services/title.service';
import { UserService } from '@app/services/user.service';
import { Tables } from '@custom-types/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { MenuItemComponent } from "@app/components/menu-item/menu-item.component";
import { RouterModule } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { LoadingComponent } from "../../../components/loading/loading.component";

@Component({
    selector: 'app-service-provider',
    standalone: true,
    templateUrl: './service-provider.page.html',
    styleUrl: './service-provider.page.scss',
    imports: [
      MenuItemComponent,
      RouterModule,
      LoadingComponent,
    ]
})
export class ServiceProviderPage {
  query;

  data?: Tables<'service_provider'>[] | null;
  error: PostgrestError | null = null;
  active: boolean | null = null;

  constructor(
    public titleService: TitleService,
    private user: UserService,
    private api: ApiService
  ) {

    this.query = this.api.client()
      .from('service_provider')
      .select('*');
  }

  ngOnInit() {
    this.titleService.setTitle("Service Providers");
    this.user.getUser().then(async (user) => {
      if(user) {
        const {data, error} = await this.query.eq('owner', user.id);
        this.data = data;
        this.error = error;

        this.api.client().from('service_provider_user').select('active').eq('id', user.id).single().then((r) => {
          this.active = r.data?.active ?? false;
        })
      }
    });
    
  }
}
