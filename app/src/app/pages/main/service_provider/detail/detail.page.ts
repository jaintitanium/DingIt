import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, QueryList, signal, ViewChildren } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { TitleService } from '@app/services/title.service';
import { PostgrestError, QueryData } from '@supabase/supabase-js';
import { CommonModule } from '@angular/common';
import { LoadingErrorBlockComponent } from '@components/loading-error-block/loading-error-block.component';
import { Tables } from '@custom-types/supabase';
import { BackButtonComponent } from "@components/back-button/back-button.component";
import { RatingComponent } from "@components/rating/rating.component";
import { MapMarker } from '@angular/google-maps';
import { DateService } from '@app/services/date.service';
import { AvatarComponent } from "@app/components/avatar/avatar.component";
import { LocationHelperService } from '@app/services/location-helper.service';
import { reviewWithUser } from '@app/interfaces/review-with-parent';
import { ReviewBadgeComponent } from "@app/components/review-badge/review-badge.component";
import { ServiceMemberBadgeComponent } from "@app/components/service-member-badge/service-member-badge.component";
import { GoogleMap } from '@capacitor/google-maps';
import { Capacitor } from '@capacitor/core';

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
      MapMarker,
      RouterModule,
      AvatarComponent,
      ReviewBadgeComponent,
      ServiceMemberBadgeComponent
    ],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class ServiceProviderDetailPage {
  @ViewChildren("map") map!: QueryList<ElementRef>;
  id: string;
  query;
  sp: QueryData<typeof this.query> | null = null;
  featured?: Tables<'product'>;
  featuredHeader?: string;
  error: PostgrestError | null = null;
  headerImageUrl: string | null = null;

  mapShow = false;
  mapDistance: number | null = null;

  reviews: reviewWithUser[] = [];
  highestReview = signal<reviewWithUser | null>(null);
  lowestReview = signal<reviewWithUser | null>(null);

  public DateService = DateService;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public title: TitleService,
    private location: LocationHelperService,
  ) {
    this.id = route.snapshot.params['id'];
    this.query = this.api.client()
      .from('service_provider')
      .select('*,\
        service_provider_hours(*),\
        product:featured_product(*),\
        team:service_provider_member(*,member_rating,service_member_user(user(*))),\
        reviews:review(*,user(*),review_tip_total),\
        provider_rating')
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
      this.reviews = data.reviews;
      if(data.reviews.length >= 1) {
        this.highestReview.set(data.reviews.sort((a,b) => b.rating - a.rating)[0]);
      }
      if(data.reviews.length >= 2) {
        this.lowestReview.set(data.reviews.filter((x) => x.id != this.highestReview()?.id).sort((a,b) => a.rating - b.rating)[0]);
      }
      this.map?.changes.subscribe({
        next: () => {
          if (this.sp && this.map && this.map.length > 0) {
            this.map.forEach((map) => this.refreshMap(map));
          }
        }
      });
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
  async refreshMap(map: ElementRef<any>) {
    const mapRef = map.nativeElement;
    if(mapRef && this.sp?.lat && this.sp.lng) {
      const newMap = await GoogleMap.create({
        id: 'map'+this.id, // Unique identifier for this map instance
        element: mapRef, // reference to the capacitor-google-map element
        apiKey: LocationHelperService.getMapsApiKey(), // Your Google Maps API Key
        config: {
          center: {
            lat: this.sp.lat,
            lng: this.sp.lng,
          },
          zoom: 14, 
          draggable: false,
          clickableIcons: false,
          disableDefaultUI: true,
        },
      });
      await newMap.addMarker({
        coordinate: {
          lat: this.sp.lat,
          lng: this.sp.lng
        },
        draggable: false,
      });
      await newMap.disableTouch();
      if(Capacitor.getPlatform() == 'ios') {
        // await newMap.enableIndoorMaps(false);
      }
      // await newMap.enableCurrentLocation(true);
      this.mapShow = true;
    }
    if(this.sp) {
      this.mapDistance = await this.location.getDistanceToServiceProvider(this.sp.id);
    }
  }

  public getScreenWidth(): number {
    return Math.min(window.innerWidth, 637);
  };

  sortedTeam() {
    return this.sp?.team.sort((a, b) => {
      return (b.member_rating ?? 0) - (a.member_rating ?? 0);
    }).slice(0,3);
  }

  navigate(lat: number, lng: number) {
    var mapUrl = lat + ',' + lng;
    // Check if a mobile device exists, or is web browser
    if(Capacitor.getPlatform() == 'ios') {
      window.open("maps://?q=" + mapUrl, '_blank');
    } else {
      window.open("https://maps.google.com/?q=" + mapUrl, '_blank');
    }
    // if ( typeof(device) !== 'undefined') {
    // var mapUrlFullPath = (this.platform.is("ios")) ? "maps://" + mapUrl : "geo:" + mapUrl;
    // } else {
    // var mapUrlType = "geo:" + mapUrl;
    // }
  }
}
