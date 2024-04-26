import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocationHelperService {

  constructor() { }

  static latLngToPg(loc: google.maps.LatLng): string {
    return 'POINT('+loc.lng()+' '+loc.lat()+')';
  }
}
