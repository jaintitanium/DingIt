import { Component } from '@angular/core';
import { ServiceProviderService } from '@app/queries/service-provider.service';
import { TitleService } from '@app/services/title.service';
import { UserService } from '@app/services/user.service';
import { Tables } from '@custom-types/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { MenuItemComponent } from "../../../components/menu-item/menu-item.component";
import { RouterModule } from '@angular/router';

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
  queryType;

  data?: Tables<'service_provider'>[] | null;
  error: PostgrestError | null = null;
  constructor(
    public titleService: TitleService,
    private user: UserService,
    public service: ServiceProviderService,
  ) {

    this.query = this.service.query();
    this.queryType = this.service.query();
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
