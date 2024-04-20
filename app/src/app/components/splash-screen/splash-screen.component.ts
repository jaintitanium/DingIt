import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SplashGuardService } from '@app/services/splash-guard.service';
import { UserService } from '@app/services/user.service';
import { Observable, Subscription, interval, timer } from 'rxjs';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [],
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.scss'
})
export class SplashScreenComponent {
  checker$: Subscription;
  videoDone = false;
  
  constructor(
    private splash: SplashGuardService,
    private router: Router,
    private user: UserService,
  ) {
    timer(3990).subscribe(() => {
      this.videoDone = true;
      console.log("Video Done")
    });
    this.checker$ = interval(1000).subscribe(() => {
      if(this.videoDone) {
        this.checker$.unsubscribe();
        let redir = this.user.getRedirectUrl();
        console.log("checking", redir);
        if(redir) {
          this.router.navigateByUrl(redir, {
            onSameUrlNavigation: 'reload'
          });
        } else {
          this.router.navigateByUrl('', {
            onSameUrlNavigation: 'reload'
          });
        }
      } else {
        console.log("Not Done");
      }
    });
  }

  ngOnInit() {
    this.splash.setDone();
  }
}
