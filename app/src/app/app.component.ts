import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet, Event, ChildrenOutletContexts } from '@angular/router';
import { MessagesIndicatorComponent } from './components/messages-indicator/messages-indicator.component';
import { filter } from 'rxjs';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Location } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { slideInAnimation } from './animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,
    MessagesIndicatorComponent,
  ],
  animations: [
    slideInAnimation
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  UrlHistory: string[] = [];
  title = 'DINGit';
  
  constructor(
    private router: Router,
    private zone: NgZone,
    private _location: Location,
    private contexts: ChildrenOutletContexts,
  ) {
    this.initializeApp();
  }
    
  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
          this.UrlHistory.push((<NavigationEnd>event).url);
      });
  }
  getPreviousUrl() {
    return this.UrlHistory[this.UrlHistory.length - 2]; 
  }
  getCurrentUrl() {
    return this.UrlHistory[this.UrlHistory.length-1]; 
  }
  initializeApp() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.zone.run(() => {
        // Example url: https://*.2dingit.com/tabs/tab2
        // slug = /tabs/tab2
        const slug = event.url.split("2dingit.com").pop();
        console.log("Navigate to " + slug)
        if (slug) {
          this.router.navigateByUrl(slug, {onSameUrlNavigation: 'reload'});
        }
        // If no match, do nothing - let regular routing
        // logic take over
      });
    });
    App.addListener('backButton', (event) => {
      if (this.getPreviousUrl() != '/loading') {
        this._location.back()
      } else {
        this.router.navigateByUrl('/')
      }
    });

    // Set Android background to transparent for Google Maps plugin
    if(Capacitor.getPlatform() == 'android' || true) {
      document.documentElement.style.setProperty('background', 'transparent');
    }
  }
  
  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'] ?? 'slide';
  }
}
