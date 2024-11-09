import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Capacitor } from '@capacitor/core';
import { Geolocation as CapGeo } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';

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
      let coords: {
        accuracy: number;
        altitude: number | null;
        altitudeAccuracy: number | null;
        heading: number | null;
        latitude: number;
        longitude: number;
        speed: number | null;
      };
      try {
        const pos = await promise;
        coords = pos.coords;
        Preferences.set({
          key: 'last-location',
          value: JSON.stringify(coords)
        });
      } catch(err: any) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        let keys = await Preferences.keys();
        if(keys.keys.some((k) => k == 'last-location')) {
          let saved = await Preferences.get({
            key: 'last-location'
          })
          coords = JSON.parse(saved.value ?? '{}');
        } else {
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

  public static getMapsApiKey(autocomplete: boolean = false): string {
    const platform = Capacitor.getPlatform();
    if(platform == 'android') {
      return 'AIzaSyAvtxOsQrLMaSUiP7pz10wn9ZaXuvZrgD8';
    } else if (platform == 'ios') {
      return autocomplete ? 'AIzaSyDkIXFdZlvCNksXLK2h4A0vE7zCCPA4yt0' : 'AIzaSyAykGpK7mKf6nIVRxlq0s6DlloVhIEcAmA';
    } else {
      return 'AIzaSyATfNk0xrd9c-S8Orw6_mS_fecupe8zr2s';
    }
  }
}
