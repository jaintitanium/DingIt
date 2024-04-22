import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { Tables } from '@custom-types/supabase';
import { PostgrestError } from '@supabase/supabase-js';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [],
  templateUrl: './edit.page.html',
  styleUrl: './edit.page.scss'
})
export class EditPage {
  public id: string | null;
  public sp?: { data: Tables<'service_provider'> | null, error: PostgrestError | null };



  form: FormGroup = new FormGroup({
    display_name: new FormControl<string>('', [Validators.required]),
    sub_title: new FormControl<string>(''),
    phone_number: new FormControl<string>(''),
    address_1: new FormControl<string>(''),
    address_2: new FormControl<string>(''),
    city: new FormControl<string>(''),
    state: new FormControl<string>(''),
    postal_code: new FormControl<string>(''),
    website: new FormControl<string>(''),
  });

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
  ) {
    this.id = this.route.snapshot.params['id'];
  }

  async ngOnInit() {
    if(this.id) {
      this.loadBase(this.id);
    } else {

    }
  }

  async loadBase(id: string) {
    this.sp = await this.api.client().from('service_provider').select('*').eq('id', id).single();
  }
}
