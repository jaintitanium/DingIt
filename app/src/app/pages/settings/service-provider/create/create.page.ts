import { Component, ViewChild } from '@angular/core';
import { TitleService } from '@app/services/title.service';
import { TextFieldComponent } from "../../../../components/forms/text-field/text-field.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { LocationHelperService } from '@app/services/location-helper.service';
import { ApiService } from '@app/services/api.service';
import { UserService } from '@app/services/user.service';
import { ToastComponent } from '@app/components/toast/toast.component';
import { Router } from '@angular/router';
import { ServiceProviderEntryComponent } from "../../../../components/forms/service-provider-entry/service-provider-entry.component";

@Component({
    selector: 'app-create',
    standalone: true,
    templateUrl: './create.page.html',
    styleUrl: './create.page.scss',
    imports: [
        TextFieldComponent,
        ReactiveFormsModule,
        GoogleMapsModule,
        GoogleMap,
        ToastComponent,
        ServiceProviderEntryComponent
    ]
})
export class CreatePage {
  @ViewChild('errorToast') errorToast!: ToastComponent;
  @ViewChild('form') form!: ServiceProviderEntryComponent;
  
  constructor(
    private titleService: TitleService,
    private api: ApiService,
    private userService: UserService,
    private router: Router,
  ) {

  }

  async ngOnInit() {
    this.titleService.setTitle("Add a new Service Provider");
  }

  async create() {
    let payload = await this.form.value();
    payload['owner'] = await this.userService.userId();

    const { data, error } = await this.api.client().from('service_provider').insert(payload).select().single();
    if(error) {
      this.errorToast.message(error.message);
    }
    if(data) {
      this.router.navigate(['settings', 'service-providers', 'edit', data.id]);
    }
  }
}
