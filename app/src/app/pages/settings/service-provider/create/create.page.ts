import { Component, ViewChild } from '@angular/core';
import { TitleService } from '@app/services/title.service';
import { TextFieldComponent } from "@app/components/forms/text-field/text-field.component";
import { ReactiveFormsModule } from '@angular/forms';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { ApiService } from '@app/services/api.service';
import { UserService } from '@app/services/user.service';
import { ToastComponent } from '@app/components/toast/toast.component';
import { Router } from '@angular/router';
import { ServiceProviderEntryComponent } from "@app/components/forms/service-provider-entry/service-provider-entry.component";
import { StripeService } from '@app/services/stripe.service';
import { LoadingComponent } from "../../../../components/loading/loading.component";

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
    ServiceProviderEntryComponent,
    LoadingComponent
]
})
export class CreatePage {
  @ViewChild('errorToast') errorToast!: ToastComponent;
  @ViewChild('form') form!: ServiceProviderEntryComponent;

  creatingFlag = false;
  
  constructor(
    private titleService: TitleService,
    private api: ApiService,
    private userService: UserService,
    private router: Router,
    private stripe: StripeService,
  ) {

  }

  async ngOnInit() {
    this.titleService.setTitle("Add a new Service Provider");
  }

  async create() {
    this.creatingFlag = true;
    let payload = await this.form.value();
    payload['owner'] = await this.userService.userId();

    const { data, error } = await this.api.client().from('service_provider').insert(payload).select().single();
    if(error) {
      this.errorToast.message(error.message);
      this.creatingFlag = false;
    }
    if(data) {
      await this.stripe.createOrUpdateSubscription();
      this.router.navigate(['settings', 'service-providers', 'edit', data.id]);
    }
  }
}
