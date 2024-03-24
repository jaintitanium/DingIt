import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Database } from '../../types/supabase';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  readonly supabase;

  constructor() {
    this.supabase = createClient<Database>(environment.supabaseUrl, environment.supabaseKey);
  }

  public client() {
    return this.supabase;
  }
}
