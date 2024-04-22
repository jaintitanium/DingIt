import { Component } from '@angular/core';
import { TitleService } from '@app/services/title.service';
import { TextFieldComponent } from "../../../../components/forms/text-field/text-field.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';

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
    ]
})
export class CreatePage {
  form: FormGroup = new FormGroup({
    display_name: new FormControl<string>('', [Validators.required]),
    address_search: new FormControl<string>(''),
    sub_title: new FormControl<string>(''),
    phone_number: new FormControl<string>(''),
    website: new FormControl<string>(''),
    address_1: new FormControl<string>(''),
    address_2: new FormControl<string>(''),
    city: new FormControl<string>(''),
    state: new FormControl<string>(''),
    postal_code: new FormControl<string>(''),
  });
  
  constructor(
    private titleService: TitleService,
  ) {

  }
  async ngOnInit() {
    this.titleService.setTitle("Add a new Service Provider");

    const input = document.getElementById("address_search") as HTMLInputElement;
    const options = {
      componentRestrictions: { country: "us" },
      fields: ["address_components", "geometry", "icon", "name"],
      strictBounds: false,
    };

    const places = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
    const autocomplete = new places.Autocomplete(input, options);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if(place.address_components) {
        this.form.get('address_1')?.setValue(
          this.getAddressCompByType(place.address_components, 'street_number') + ' ' + 
          this.getAddressCompByType(place.address_components, 'route'));
        this.form.get('address_2')?.setValue(this.getAddressCompByType(place.address_components, 'subpremise'));
        this.form.get('city')?.setValue(this.getAddressCompByType(place.address_components, 'locality'));
        this.form.get('state')?.setValue(this.getAddressCompByType(place.address_components, 'administrative_area_level_1', true));
        this.form.get('postal_code')?.setValue(this.getAddressCompByType(place.address_components, 'postal_code'));
      }
      
      console.log(place);
    })
  }

  getAddressCompByType(components: google.maps.GeocoderAddressComponent[], type: string, short: boolean = false): string | null {
    let comp = components.find((x) => x.types.includes(type));
    if(comp) {
      if(short) {
        return comp.short_name;
      } else {
        return comp.long_name;
      }
    } else {
      return null
    }
  }
}
