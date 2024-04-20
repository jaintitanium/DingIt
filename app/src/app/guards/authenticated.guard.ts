import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const authenticatedGuard: CanActivateFn = (route, state) => {
  const usr = inject(UserService);
  let loggedIn = usr.isLoggedIn();
  if(loggedIn) {
    return true;
  } else {
    usr.setRedirectUrl(state.url);
    inject(Router).navigate(['login'], {
      skipLocationChange: true
    });
  }
  return false;
};
