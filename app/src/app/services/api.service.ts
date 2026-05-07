import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '@app/../environments/environment';
import { Database } from '@app/../types/supabase';

const noOpAuthLock = async <T>(_name: string, _acquireTimeout: number, fn: () => Promise<T>) => fn();

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  readonly supabase;

  constructor() {
    this.supabase = createClient<Database>(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        lock: noOpAuthLock,
      },
    });
  }

  public client() {
    return this.supabase;
  }
}
