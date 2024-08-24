import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '@app/../environments/environment';
import { Database } from '@app/../types/supabase';

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
