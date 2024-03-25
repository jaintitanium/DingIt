import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { TextFieldComponent } from "../../components/forms/text-field/text-field.component";

@Component({
    selector: 'app-complete-profile',
    standalone: true,
    templateUrl: './complete-profile.page.html',
    styleUrl: './complete-profile.page.scss',
    imports: [
        ReactiveFormsModule,
        TextFieldComponent
    ]
})
export class CompleteProfilePage {
  profileForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  constructor(
    private userService: UserService,
    private router: Router,
    private api: ApiService,
  ) {
    let redir = userService.getRedirectUrl();
    if(redir) {
      userService.checkProfileComplete().then((complete) => {
        if(complete && redir) {
          this.router.navigateByUrl(redir);
          this.userService.clearRedirectUrl();
        } else {

        }
      });
    }
  }

  async setProfile() {
    let url = this.userService.getRedirectUrl();
    if(this.profileForm.valid) {
      let id = await this.userService.userId();
      const { data, error } = await this.api.client().from('user').upsert({
        id: id,
        name: this.profileForm.get('name')?.value
      }).select('*');
      if(data && url) {
        await this.userService.checkProfileComplete();
        this.router.navigateByUrl(url);
        this.userService.clearRedirectUrl();
      }
    }
  }
}
