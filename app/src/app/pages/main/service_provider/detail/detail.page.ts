import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { TitleService } from '@app/services/title.service';
import { PostgrestError, QueryData } from '@supabase/supabase-js';
import { ServiceProviderService } from '@app/queries/service-provider.service';
import { CommonModule } from '@angular/common';
import { LoadingErrorBlockComponent } from '@components/loading-error-block/loading-error-block.component';
import { Tables } from '@custom-types/supabase';
import { BackButtonComponent } from "@components/back-button/back-button.component";
import { RatingComponent } from "@components/rating/rating.component";

@Component({
    selector: 'app-detail',
    standalone: true,
    templateUrl: './detail.page.html',
    styleUrl: './detail.page.scss',
    imports: [
        CommonModule,
        LoadingErrorBlockComponent,
        BackButtonComponent,
        RatingComponent
    ]
})
export class DetailPage {
  id: string;
  query;
  queryType;
  sp: QueryData<typeof this.queryType> | null = null;
  error: PostgrestError | null = null;
  headerImageUrl: string | null = null;
  daysOfWeek: string[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public title: TitleService,
    public service: ServiceProviderService,
  ) {
    this.query = this.service.query();
    this.queryType = this.service.query().single();
    this.id = route.snapshot.params['id'];

    //this.titleService.setTitle("Account Settings");
  }

  async ngOnInit() {
    const {data, error} = await this.query.eq('id', this.id).single();
    this.sp = data;
    this.error = error;
    if(data?.header_image_path) {
      this.headerImageUrl = this.api.client().storage.from('service_providers')
        .getPublicUrl(data.header_image_path)
        .data
        .publicUrl;
        console.log(this.headerImageUrl)
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
  formatTime(input: string): string {
    let date = new Date('1/1/00 '+input);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    var strMinutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + (date.getMinutes() == 0 ? '' : ':' + strMinutes) + ampm;
    return strTime;
    // return dt.getHours() + (dt.getMinutes() == 0 ? '' : ':'+dt.getMinutes()) + ' ' + dt.get
  }
}
