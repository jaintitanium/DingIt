import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SplashGuardService } from '@app/services/splash-guard.service';
import { UserService } from '@app/services/user.service';

export const splashGuard: CanActivateFn = (route, state) => {
  const usr = inject(UserService);
  if(inject(SplashGuardService).done()) {
    return true;
  } else {
    usr.setRedirectUrl(state.url);
    inject(Router).navigate(['loading'], {
      skipLocationChange: true
    });
  }
  return false;

};
