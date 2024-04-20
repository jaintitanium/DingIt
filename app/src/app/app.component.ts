import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet, Event } from '@angular/router';
import { environment } from '../environments/environment.development';
import { MessagesIndicatorComponent } from './components/messages-indicator/messages-indicator.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MessagesIndicatorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  UrlHistory: string[] = [];
  title = 'DingIt!';
  
  constructor(private router: Router) {}
    
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
}
