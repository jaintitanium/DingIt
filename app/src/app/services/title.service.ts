import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  public readonly prefix: string = 'DingIt!'; 
  public short = signal('');
  public long = signal(this.prefix);
  constructor() { }

  setTitle(title: string) {
    this.short.set(title);
    if(title?.length > 0) {
      this.long.set(this.prefix + ' | ' + title);
    } else {
      this.long.set(this.prefix);
    }
  }
}
