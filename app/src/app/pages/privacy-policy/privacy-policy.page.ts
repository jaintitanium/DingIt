import { Component } from '@angular/core';
import { BackButtonComponent } from "../../components/back-button/back-button.component";

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [BackButtonComponent],
  templateUrl: './privacy-policy.page.html',
  styleUrl: './privacy-policy.page.scss'
})
export class PrivacyPolicyPage {

}
