import { Component } from '@angular/core';
import { BackButtonComponent } from "../../../components/back-button/back-button.component";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Database } from '@custom-types/supabase';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LoadingComponent } from "../../../components/loading/loading.component";
import { LocationHelperService } from '@app/services/location-helper.service';
import { DecimalPipe } from '@angular/common';
import { AvatarComponent } from "../../../components/avatar/avatar.component";
import { S3ImgComponent } from "../../../components/s3-img/s3-img.component";

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    BackButtonComponent,
    ReactiveFormsModule,
    LoadingComponent,
    DecimalPipe,
    AvatarComponent,
    S3ImgComponent,
    RouterModule,
  ],
  templateUrl: './search.page.html',
  styleUrl: './search.page.scss'
})
export class SearchPage {
  results?: Database['public']['Functions']['search_service_provider']['Returns'] | null;
  searchActive = false;

  searchForm = new FormGroup({
    input: new FormControl<string | null>(null),
  })

  constructor(
    private route: ActivatedRoute,
    private location: LocationHelperService,
    private router: Router,
  ) {
    let search_text = route.snapshot.queryParams['search_text'];
    if(search_text) {
      this.searchForm.get('input')?.setValue(search_text);
      this.executeSearch();
    }
  }

  async executeSearch() {
    this.searchActive = true;
    this.results = null;
    this.router.navigate(['search'], {queryParams: { search_text: this.searchForm.value.input }})
    this.results = await this.location.searchProviders(this.searchForm.value.input ?? '');
  }
}
