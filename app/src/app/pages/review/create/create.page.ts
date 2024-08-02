import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { PostgrestError, QueryData } from '@supabase/supabase-js';
import { LoadingErrorBlockComponent } from "../../../components/loading-error-block/loading-error-block.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RatingComponent } from "../../../components/rating/rating.component";
import { TextFieldComponent } from "../../../components/forms/text-field/text-field.component";
import { FieldValidationComponent } from "../../../components/forms/field-validation/field-validation.component";
import { SelectFieldComponent } from "../../../components/forms/select-field/select-field.component";
import { CommonModule } from '@angular/common';
import { AvatarComponent } from "../../../components/avatar/avatar.component";
import { S3ImgComponent } from "../../../components/s3-img/s3-img.component";
import { ToastComponent } from "../../../components/toast/toast.component";

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    LoadingErrorBlockComponent,
    RatingComponent,
    TextFieldComponent,
    ReactiveFormsModule,
    FieldValidationComponent,
    SelectFieldComponent,
    CommonModule,
    AvatarComponent,
    S3ImgComponent,
    ToastComponent
],
  templateUrl: './create.page.html',
  styleUrl: './create.page.scss'
})
export class CreateReviewPage {
  @ViewChild('errorToast') errorToast!: ToastComponent;
  type: string;
  id: string;
  spQuery;
  sp: QueryData<typeof this.spQuery> | null = null;
  error: PostgrestError | null = null;

  generalForm = new FormGroup({
    description: new FormControl<string>('', [Validators.required]),
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
      return x.id == id;
    })?.service_member_user;
  }
  membersForSelect(): {value: string, label: string}[] {
    if(this.sp && this.sp.service_provider_member) {
      return this.sp?.service_provider_member.filter((x) => {
        return x.id == this.editMember || !this.membersInRating().includes(x.id);
      }).map((x) => {
        return { value: x.id, label: x.service_member_user!.user!.name }
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
    let review = this.memberForm.value;
    if(review.service_member) {
      this.memberRatings.push({
        id: review.service_member,
        description: review.description ?? '',
        rating: review.rating ?? 5
      });
      this.newMember = false;
    }
  }
  startNewMember() {
    this.memberForm.reset();
    this.newMember = true;
  }
  newMember = false;
  editMember: string | null = null;


  productForm = new FormGroup({
    description: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    product: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    rating: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
  });
  productRatings: { id: string, description: string, rating: number }[] = [];
  productsInRating(): string[] {
    return this.productRatings.map((x) => x.id);
  }
  product(id: string) {
    return this.sp?.products.find((x) => {
      return x.id == id;
    });
  }
  productsForSelect(): {value: string, label: string}[] {
    if(this.sp && this.sp.products) {
      return this.sp?.products.filter((x) => {
        return x.id == this.editProduct || !this.productsInRating().includes(x.id);
      }).map((x) => {
        return { value: x.id, label: x.display_name }
      })
    } else {
      return [];
    }
  }
  startEditProduct(id: string) {
    this.editProduct = id;
  }
  cancelEditProduct() {
    this.editProduct = null;
  }
  saveEditProduct() {
    let review = this.productForm.value;
    if(review.product) {
      this.deleteProduct(review.product);
      this.productRatings.push({
        id: review.product,
        description: review.description ?? '',
        rating: review.rating ?? 5
      });
      this.editProduct = null;
    }
  }
  deleteProduct(id: string) {
    this.productRatings = this.productRatings.filter((x) => x.id != id);
  }
  cancelNewProduct() {
    this.newProduct = false;
  }
  saveNewProduct() {
    let review = this.productForm.value;
    if(review.product) {
      this.productRatings.push({
        id: review.product,
        description: review.description ?? '',
        rating: review.rating ?? 5
      });
      this.newProduct = false;
    }
  }
  startNewProduct() {
    this.productForm.reset();
    this.newProduct = true;
  }
  newProduct = false;
  editProduct: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
  ) {
    this.type = route.snapshot.params['type'];
    this.id = route.snapshot.params['id'];
    this.spQuery = this.api.client().from('service_provider')
      .select('*,service_provider_member!inner(id,service_member_user(id,user(*))),products:product!product_owner_fkey(*)')
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

  async saveReview() {
    const general = this.generalForm.value;
    const user = await (await this.api.client().auth.getUser()).data.user;
    if(general && user && this.sp) {
      const base = await this.api.client().from('review').insert({
        description: general.description ?? 'Error',
        rating: general.rating ?? 0,
        service_provider: this.sp.id,
        owner: user.id
      }).select().single();
      if(base.error) {
        this.errorToast.message(base.error.message);
        return;
      }

      if(base.data && this.memberRatings.length > 0) {
        const memberReviews = await this.api.client().from('review_service_member').insert(
          this.memberRatings.map((x) => {
            return {
              review: base.data.id,
              service_member: x.id,
              description: x.description,
              rating: x.rating,
            };
          })
        );
        if(memberReviews.error) {
          this.errorToast.message(memberReviews.error.message);
          return;
        }
      }

      if(base.data && this.productRatings.length > 0) {
        const productReviews = await this.api.client().from('review_product').insert(
          this.productRatings.map((x) => {
            return {
              review: base.data.id,
              product: x.id,
              description: x.description,
              rating: x.rating,
            };
          })
        );
        if(productReviews.error) {
          this.errorToast.message(productReviews.error.message);
          return;
        }
      }

      this.router.navigate(['service-provider', this.sp.id]);
    }
  }

  ratingText(v: number): string {
    if(v == 0) {
      return '';
    } else if(v <= 1) {
      return 'Highly Dissatisfied';
    } else if (v <= 2) {
      return 'Dissatisfied';
    } else if (v <= 3) {
      return 'OK';
    } else if (v <= 4) {
      return 'Satisfied';
    } else if (v > 4) {
      return 'Highly Satisfied';
    } else {
      return '';
    }
  }
}
