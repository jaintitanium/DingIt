import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-redirect',
  standalone: true,
  imports: [],
  templateUrl: './redirect.page.html',
  styleUrl: './redirect.page.scss'
})
export class RedirectPage {

  constructor(
    private router: Router,
  ) {
    this.redirect();
  }

  async redirect() {
    setTimeout(() => this.router.navigate(['profile']), 2000)
  }
}
