import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { TitleService } from '@app/services/title.service';
import { PostgrestError, QueryData } from '@supabase/supabase-js';
import { CommonModule } from '@angular/common';
import { LoadingErrorBlockComponent } from '@components/loading-error-block/loading-error-block.component';
import { Tables } from '@custom-types/supabase';
import { BackButtonComponent } from "@components/back-button/back-button.component";
import { RatingComponent } from "@components/rating/rating.component";
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { DateService } from '@app/services/date.service';

@Component({
    selector: 'app-detail',
    standalone: true,
    templateUrl: './detail.page.html',
    styleUrl: './detail.page.scss',
    imports: [
    CommonModule,
    LoadingErrorBlockComponent,
    BackButtonComponent,
    RatingComponent,
    GoogleMap,
    MapMarker,
    RouterModule,
]
})
export class DetailPage {
  id: string;
  query;
  sp: QueryData<typeof this.query> | null = null;
  featured?: Tables<'product'>;
  featuredHeader?: string;
  error: PostgrestError | null = null;
  headerImageUrl: string | null = null;

  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    // center: {lat: 40, lng: -20},
    zoom: 14,
    draggable: false
  };
  center: google.maps.LatLngLiteral = {lat: 24, lng: 12};
  mapShow = false;
  mapDistance: number | null = null;
  markerOptions: google.maps.MarkerOptions = {draggable: false};

  public DateService = DateService;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public title: TitleService,
  ) {
    this.id = route.snapshot.params['id'];
    this.query = this.api.client()
      .from('service_provider')
      .select('*,service_provider_hours(*),product:featured_product(*)')
      .eq('id', this.id)
      .single();
  }

  async ngOnInit() {
    const {data, error} = await this.query;
    this.sp = data;
    this.error = error;
    if(data) {
      this.title.setTitle(data.display_name);
      if(data.header_image_path) {
        this.headerImageUrl = this.api.client().storage.from('service_providers')
          .getPublicUrl(data.header_image_path)
          .data
          .publicUrl;
      }
      this.featured = data.product as unknown as Tables<'product'>;
      if(this.featured && this.featured.image_path) {
        this.featuredHeader = this.api.client().storage.from('service_providers')
          .getPublicUrl(this.featured.image_path)
          .data
          .publicUrl;
      }
      this.refreshMap(data);
    } else {
      this.title.setTitle("");
    }
    
  }
  reorganizeHours(raw: Tables<'service_provider_hours'>[]) {
    raw.sort((a,b) => {
      return Date.parse('01 Jan 1970 ' + a.open_time) - Date.parse('01 Jan 1970 ' + b.open_time);
    });
    let org: Tables<'service_provider_hours'>[][] = [];
    for (let index = 0; index < 7; index++) {
      org[index] = [];
      raw.filter((x) => x.day_of_week == index).forEach((x) => org[index].push(x));
    }
    return org;
  }
  async refreshMap(sp: Tables<'service_provider'>) {
    if(sp.lat && sp.lng) {
      this.mapShow = true;
      this.mapOptions.center = {
        lat: sp.lat,
        lng: sp.lng
      }

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const crd = pos.coords;
      
        const { data, error } = await this.api.client().rpc('get_service_provider_distance', {
          input_id: sp.id,
          input_lat: crd.latitude,
          input_lng: crd.longitude
        });
        if(data) {
          this.mapDistance = data;
        }
      }, (err) => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
      }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });
    }
  }

  public getScreenWidth(): number {
    return Math.min(window.innerWidth, 637);
  };

  navigate(lat: number, lng: number) {
    var mapUrl = '?q=' + lat + ',' + lng;
    // Check if a mobile device exists, or is web browser
    // if ( typeof(device) !== 'undefined') {
    // var mapUrlFullPath = (this.platform.is("ios")) ? "maps://" + mapUrl : "geo:" + mapUrl;
    // } else {
    // var mapUrlType = "geo:" + mapUrl;
    // }
    window.open("maps://" + mapUrl, '_blank');
  }
}
