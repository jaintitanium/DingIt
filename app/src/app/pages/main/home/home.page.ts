import { Component } from '@angular/core';
import { LoadingErrorBlockComponent } from "@app/components/loading-error-block/loading-error-block.component";
import { ApiService } from '@app/services/api.service';
import { Tables } from '@custom-types/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.page.html',
    styleUrl: './home.page.scss',
    imports: [
      LoadingErrorBlockComponent,
      RouterModule,
    ]
})
export class HomePage {
  list?: Tables<'service_provider'>[];
  error: PostgrestError | null = null;
  
  constructor(
    private api: ApiService,
  ) {

  }
  async ngOnInit() {
    const {data, error} = await this.api.client().from('service_provider')
      .select('*,service_provider_hours(*)');
    this.error = error;
    if(data) {
      this.list = data;
    }
  }

  getPublicUrl(url: string | null) {
    if(!url) return '';
    return this.api.client().storage.from('service_providers')
      .getPublicUrl(url)
      .data
      .publicUrl;
  }
}
