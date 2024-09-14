import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor() { }

  static dataURLtoBlob(dataurl: string) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/),
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type: mime ? mime[1] : ''});
  }
}
