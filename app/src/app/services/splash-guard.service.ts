import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SplashGuardService {
  public done = signal(false);
  constructor() { }

  setDone() {
    this.done.set(true);
  }
}
