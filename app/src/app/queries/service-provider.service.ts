import { Injectable } from '@angular/core';
import { QueryData, SupabaseClient } from '@supabase/supabase-js';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceProviderService {

  serviceProviderQuery;
  // type ServiceProvider = QueryData<typeof serviceProviderQuery>;
  constructor(
    private api: ApiService,
  ) {
    this.serviceProviderQuery = this.api.client()
      .from('service_provider')
        .select('*,service_provider_hours(*)');
  }

  query() {
    return this.serviceProviderQuery;
  }
}
