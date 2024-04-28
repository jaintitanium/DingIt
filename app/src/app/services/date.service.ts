import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {
  static daysOfWeek: string[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  constructor() { }


  static formatTime(input: string): string {
    let date = new Date('1/1/00 '+input);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    var strMinutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + (date.getMinutes() == 0 ? '' : ':' + strMinutes) + ampm;
    return strTime;
    // return dt.getHours() + (dt.getMinutes() == 0 ? '' : ':'+dt.getMinutes()) + ' ' + dt.get
  }
}
