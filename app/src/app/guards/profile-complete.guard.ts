import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { inject } from '@angular/core';

export const profileCompleteGuard: CanActivateFn = (route, state) => {
  const usr = inject(UserService)
  let complete = usr.profileCompleted();
  if (complete) {
    return true;
  } else {
    usr.setRedirectUrl(state.url);
    inject(Router).navigate(['complete-profile']);
  }
  return false;
};
