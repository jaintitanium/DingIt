import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { PostgrestError, QueryData } from '@supabase/supabase-js';
import { LoadingErrorBlockComponent } from "@app/components/loading-error-block/loading-error-block.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RatingComponent } from "@app/components/rating/rating.component";
import { TextFieldComponent } from "@app/components/forms/text-field/text-field.component";
import { FieldValidationComponent } from "@app/components/forms/field-validation/field-validation.component";
import { SelectFieldComponent } from "@app/components/forms/select-field/select-field.component";
import { CommonModule } from '@angular/common';
import { AvatarComponent } from "@app/components/avatar/avatar.component";
import { S3ImgComponent } from "@app/components/s3-img/s3-img.component";
import { ToastComponent } from "@app/components/toast/toast.component";
import { StripeService } from '@app/services/stripe.service';
import { BackButtonComponent } from "../../../../components/back-button/back-button.component";
import { LoadingComponent } from "../../../../components/loading/loading.component";

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
    ToastComponent,
    BackButtonComponent,
    LoadingComponent
],
  templateUrl: './create.page.html',
  styleUrl: './create.page.scss'
})
export class CreateReviewPage {
  @ViewChild('errorToast') errorToast!: ToastComponent;
  type: string;
  id: string;
  providerQuery;
  spProvider: QueryData<typeof this.providerQuery> | null = null;
  memberQuery;
  spMember: QueryData<typeof this.memberQuery> | null = null;
  error: PostgrestError | null = null;

  sp() {
    if(this.type == 'provider') {
      return this.spProvider;
    } else {
      return this.spMember;
    }
  }

  createButtonLoading = false;

  generalForm = new FormGroup({
    description: new FormControl<string>('', [Validators.required]),
    rating: new FormControl<number | null>(null, [Validators.required]),
  });

  memberForm = new FormGroup({
    description: new FormControl<string>(''),
    service_member: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    rating: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
    tip: new FormControl<number | null>(null),
  });
  memberRatings: { id: string, description: string, rating: number, tip: number | null }[] = [];
  membersInRating(): string[] {
    return this.memberRatings.map((x) => x.id);
  }
  member(id: string) {
    return this.sp()?.service_provider_member.find((x) => {
      return x.id == id;
    })?.service_member_user;
  }
  membersForSelect(): {value: string, label: string}[] {
    const sp = this.sp();
    if(sp && sp.service_provider_member) {
      return sp.service_provider_member.filter((x) => {
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
        description: (review.description != '' ? review.description : this.promptText(review.rating ?? 0)) ?? '',
        rating: review.rating ?? 5,
        tip: this.member(review.service_member)?.onboarded ? (review.tip ?? null) : null,
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
        description: (review.description != '' ? review.description : this.promptText(review.rating ?? 0)) ?? '',
        rating: review.rating ?? 5,
        tip: this.member(review.service_member)?.onboarded ? (review.tip ?? null) : null,
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
    return this.sp()?.products.find((x) => {
      return x.id == id;
    });
  }
  productsForSelect(): {value: string, label: string}[] {
    const sp = this.sp();
    if(sp && sp.products) {
      return sp.products.filter((x) => {
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
    private stripe: StripeService,
  ) {
    this.type = route.snapshot.params['type'];
    this.id = route.snapshot.params['id'];
    this.providerQuery = this.api.client().from('service_provider')
      .select('*,service_provider_member!left(id,service_member_user!inner(id,stripe_account_id,onboarded,user!inner(*))),products:product!product_owner_fkey(*)')
      .eq('id', this.id)
      .single();
    this.memberQuery = this.api.client().from('service_provider')
      .select('*,service_provider_member!inner(id,service_member_user!inner(id,stripe_account_id,onboarded,user!inner(*))),products:product!product_owner_fkey(*)')
      .eq('service_provider_member.id', this.id)
      .single();
    if(this.type == 'member') {
      this.memberForm.setValue({
        service_member: this.id,
        description: '',
        rating: null,
        tip: null
      });
    }
  }

  async ngOnInit() {
    if(this.type == 'provider') {
      const {data, error} = await this.providerQuery;
      this.spProvider = data;
      this.error = error;
    }
    if (this.type == 'member') {
      const {data, error} = await this.memberQuery;
      this.spMember = data;
      this.error = error;
    }
  }

  async saveReview() {
    const general = this.generalForm.value;
    const user = await (await this.api.client().auth.getUser()).data.user;
    const sp = this.sp();
    if(general && user && sp) {
      this.createButtonLoading = true;
      const base = await this.api.client().from('review').insert({
        description: general.description ?? 'Error',
        rating: general.rating ?? 0,
        service_provider: sp.id,
        owner: user.id
      }).select().single();
      if(base.error) {
        this.errorToast.message(base.error.message);
        this.createButtonLoading = false;
        return;
      }

      if(this.type == 'member') {
        this.memberRatings.push({
          id: this.id,
          description: (this.memberForm.get('description')?.value != '' ? this.memberForm.get('description')?.value : this.promptText(this.memberForm.get('rating')?.value ?? 0)) ?? '',
          rating: this.memberForm.get('rating')?.value ?? 0,
          tip: this.memberForm.get('tip')?.value ?? null
        });
      }

      if(base.data && this.memberRatings.length > 0) {
        const memberReviews = await this.api.client().from('review_service_member').insert(
          this.memberRatings.map((x) => {
            return {
              review: base.data.id,
              service_member: x.id,
              description: x.description,
              rating: x.rating,
              tip: x.tip,
            };
          })
        );
        if(memberReviews.error) {
          this.errorToast.message(memberReviews.error.message);
          this.createButtonLoading = false;
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
          this.createButtonLoading = false;
          return;
        }
      }
      if(this.memberRatings.reduce((total, item) => { return total + (item.tip ?? 0) }, 0) > 0) {
        const checkout = await this.stripe.getCheckoutSessionForReview(base.data.id);
        if(checkout.data) {
          window.open(checkout.data, "_self");
        } else {
          this.errorToast.message(checkout.error.message);
          this.createButtonLoading = false;
        }
      } else {
        if(this.type == 'member') {
          this.router.navigate(['service-member', this.id]);
        } else {
          this.router.navigate(['service-provider', this.id]);
        }
      }
    }
  }

  ratingText(v: number): string {
    if(v == 0) {
      return '';
    } else if(v <= 1) {
      return 'Highly Dissatisfied (too many negative bells could affect your DINGit credibility as a reviewer)';
    } else if (v <= 1.5) {
      return 'Dissatisfied (too many negative bells could affect your DINGit credibility as a reviewer)';
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

  promptText(v: number): string {
    if(v == 0) {
      return '';
    } else if(v <= 1) {
      return 'Unsatisfactory, some improvement is necessary';
    } else if (v <= 2) {
      return 'Below Average customer performance, can be improved with training';
    } else if (v <= 3) {
      return 'Above Average customer performance';
    } else if (v <= 4) {
      return 'Very satisfied with customer care';
    } else if (v > 4) {
      return 'Amazing, Personable, Hands-On';
    } else {
      return '';
    }
  }
}
