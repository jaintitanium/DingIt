import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Capacitor } from '@capacitor/core';
import { Geolocation as CapGeo } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class LocationHelperService {
  options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  constructor(
    private api: ApiService,
  ) { }

  static latLngToPg(loc: google.maps.LatLng): string {
    return 'POINT('+loc.lng()+' '+loc.lat()+')';
  }

  async getDistanceToServiceProvider(id: string) {
    const coords = await this.getPosition(this.options);
  
    const { data, error } = await this.api.client().rpc('get_service_provider_distance', {
      input_id: id,
      input_lat: coords.latitude,
      input_lng: coords.longitude
    });
    if(error) {
      return null;
    }
    return data;
  }

  async getLocalHotspots() {
    const coords = await this.getPosition(this.options);
  
    const { data, error } = await this.api.client().rpc('get_hotspots', {
      input_lat: coords.latitude,
      input_lng: coords.longitude
    });
    if(error) {
      return [];
    }
    return data;
  }

  async searchProviders(search_text: string) {
    const coords = await this.getPosition(this.options);
  
    const { data, error } = await this.api.client().rpc('search_service_provider', {
      search_text: search_text,
      input_lat: coords.latitude,
      input_lng: coords.longitude
    });
    if(error) {
      return [];
    }
    return data;
  }

  async getPosition(options: PositionOptions) {
    if(Capacitor.getPlatform() == 'web') {
      let promise = new Promise<GeolocationPosition>(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
      let coords: GeolocationCoordinates;
      try {
        const pos = await promise;
        coords = pos.coords;
      } catch(err: any) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        coords = {
          accuracy: 0,
          altitude: 0,
          altitudeAccuracy: 0,
          heading: 0,
          speed: 0,
          latitude: 49.263266,
          longitude: -123.11747,
        }
      }
      return coords;
    } else {
      const perms = await CapGeo.checkPermissions();
      if(!perms.location) {
        await CapGeo.requestPermissions();
      }
      let coords = (await CapGeo.getCurrentPosition({enableHighAccuracy: true})).coords;
      return coords;
    }
  }
}
