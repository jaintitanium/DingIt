import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class LocationHelperService {

  constructor(
    private api: ApiService,
  ) { }

  static latLngToPg(loc: google.maps.LatLng): string {
    return 'POINT('+loc.lng()+' '+loc.lat()+')';
  }

  getDistanceToServiceProvider(id: string, success: (distance: number) => void, failure: (err: {code: number, message: string}) => void) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const crd = pos.coords;
    
      const { data, error } = await this.api.client().rpc('get_service_provider_distance', {
        input_id: id,
        input_lat: crd.latitude,
        input_lng: crd.longitude
      });
      if(data) {
        success(data)
      }
    }, (err) => {
      console.warn(`ERROR(${err.code}): ${err.message}`);
      failure(err);
    }, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  }
}
