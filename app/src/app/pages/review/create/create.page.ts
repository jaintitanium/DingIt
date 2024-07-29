import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { PostgrestError, QueryData } from '@supabase/supabase-js';
import { LoadingErrorBlockComponent } from "../../../components/loading-error-block/loading-error-block.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RatingComponent } from "../../../components/rating/rating.component";
import { TextFieldComponent } from "../../../components/forms/text-field/text-field.component";
import { FieldValidationComponent } from "../../../components/forms/field-validation/field-validation.component";
import { SelectFieldComponent } from "../../../components/forms/select-field/select-field.component";

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    LoadingErrorBlockComponent,
    RatingComponent,
    TextFieldComponent,
    ReactiveFormsModule,
    FieldValidationComponent,
    SelectFieldComponent
],
  templateUrl: './create.page.html',
  styleUrl: './create.page.scss'
})
export class CreateReviewPage {
  type: string;
  id: string;
  spQuery;
  sp: QueryData<typeof this.spQuery> | null = null;
  error: PostgrestError | null = null;

  generalForm = new FormGroup({
    description: new FormControl<string>('', [Validators.required]),
    rating: new FormControl<number | null>(null, [Validators.required]),
  });
  productForm = new FormGroup({
    description: new FormControl<string>('', [Validators.required]),
    product: new FormControl<string>('', [Validators.required]),
    rating: new FormControl<number | null>(null, [Validators.required]),
  });

  memberForm = new FormGroup({
    description: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    service_member: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    rating: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
  });
  memberRatings: { id: string, description: string, rating: number }[] = [];
  membersInRating(): string[] {
    return this.memberRatings.map((x) => x.id);
  }
  member(id: string) {
    return this.sp?.service_provider_member.find((x) => {
      return x.service_member_user?.id == id;
    })?.service_member_user?.user;
  }
  membersForSelect(): {value: string, label: string}[] {
    if(this.sp && this.sp.service_provider_member) {
      return this.sp?.service_provider_member.filter((x) => {
        if(x.service_member_user) {
          return !this.membersInRating().includes(x.service_member_user?.id)
        } else {
          return false;
        }
      }).map((x) => {
        return { value: x.service_member_user!.id, label: x.service_member_user!.user!.name }
      })
    } else {
      return [];
    }
  }
  startEditMember(id: string) {
    this.editMember = id;
  }
  cancelEditMember() {
    this.editMember = null;
  }
  saveEditMember() {
    let review = this.memberForm.value;
    if(review.service_member) {
      this.deleteMember(review.service_member);
      this.memberRatings.push({
        id: review.service_member,
        description: review.description ?? '',
        rating: review.rating ?? 5
      });
      this.editMember = null;
    }
  }
  deleteMember(id: string) {
    this.memberRatings = this.memberRatings.filter((x) => x.id != id);
  }
  cancelNewMember() {
    this.newMember = false;
  }
  saveNewMember() {
    // TODO
  }
  startNewMember() {
    // TODO
  }
  newMember = false;
  editMember: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
  ) {
    this.type = route.snapshot.params['type'];
    this.id = route.snapshot.params['id'];
    this.spQuery = this.api.client().from('service_provider')
      .select('*,service_provider_member!inner(service_member_user(id,user(*))),product!product_owner_fkey(*)')
      .eq(this.type == 'provider' ? 'id' : 'service_provider_member.id', this.id)
      .single();
    if(this.type == 'member') {
      this.memberForm.setValue({
        service_member: this.id,
        description: '',
        rating: null
      });
    }
  }

  async ngOnInit() {
    const {data, error} = await this.spQuery;
    this.sp = data;
    this.error = error;

    // if(data?.service_provider_member && this.type == 'provider') {
    //   this.membersForSelect = data.service_provider_member.map( (p) => {
    //     return {
    //       value: p.service_member_user?.user?.id ?? '',
    //       label: p.service_member_user?.user?.name ?? ''
    //     }
    //   });
    // }
  }

  test() {
    console.log(this.generalForm.value)
  }
}
