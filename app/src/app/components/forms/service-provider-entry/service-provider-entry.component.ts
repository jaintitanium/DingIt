import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextFieldComponent } from "../text-field/text-field.component";
import { LocationHelperService } from '@app/services/location-helper.service';

@Component({
    selector: 'app-service-provider-form',
    standalone: true,
    templateUrl: './service-provider-entry.component.html',
    styleUrl: './service-provider-entry.component.scss',
    imports: [
        ReactiveFormsModule,
        TextFieldComponent
    ]
})
export class ServiceProviderEntryComponent {
  @Input('data') set data(input: any) {
    if(input) {
      // let formKeys = Object.keys(this.form);
      Object.keys(input).forEach((k) => {
        this.form.get(k)?.setValue(input[k]);
      })

    }
  }

  form: FormGroup = new FormGroup({
    display_name: new FormControl<string>('', [Validators.required]),
    address_search: new FormControl<string>(''),
    sub_title: new FormControl<string>(''),
    phone_number: new FormControl<string>(''),
    website: new FormControl<string>(''),
    address_1: new FormControl<string>(''),
    address_2: new FormControl<string>(''),
    city: new FormControl<string>('', [Validators.required]),
    state: new FormControl<string>('', [Validators.required]),
    postal_code: new FormControl<string>(''),
  });
  location?: google.maps.LatLng;

  async ngOnInit() {
    const input = document.getElementById("address_search") as HTMLInputElement;
    const options = {
      componentRestrictions: { country: "us" },
      fields: ["address_components", "geometry", "name"],
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
        this.location = place.geometry?.location;
      }
    })
  }
  valid() {
    return this.form.valid;
  }
  async value() {
    let payload = this.form.value;
    if(this.location) {
      payload['location'] = LocationHelperService.latLngToPg(this.location);
    } else {
      const geocoding = await google.maps.importLibrary("geocoding") as google.maps.GeocodingLibrary;
      const geocoder = new geocoding.Geocoder();
      let result = await geocoder.geocode({
        address: [payload.display_name, payload.address_1, payload.address_2, payload.city, payload.state, payload.postal_code].join(' ')
      });
      if(result.results && result.results[0] && result.results[0].geometry)
        payload['location'] = LocationHelperService.latLngToPg(result.results[0].geometry.location);
    }
    delete payload['address_search'];
    return payload;
  }
  set(input: any) {
    this.form.setValue(input);
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
