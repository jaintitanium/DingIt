import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { RootPage } from './pages/main/root/root.page';
import { SignUpPage } from './pages/sign-up/sign-up.page';
import { TestPage } from './pages/main/test/test.page';
import { MessagesPage } from './pages/main/messages/messages.page';
import { MoneyPage } from './pages/main/money/money.page';
import { ProfilePage } from './pages/main/profile/profile.page';
import { profileCompleteGuard } from './guards/profile-complete.guard';
import { CompleteProfilePage } from './pages/complete-profile/complete-profile.page';
import { authenticatedGuard } from './guards/authenticated.guard';

export const routes: Routes = [
    { path: 'login', component: LoginPage },
    { path: 'signup', component: SignUpPage },
    { path: 'complete-profile', component: CompleteProfilePage },
    { path: '', component: RootPage, children: [
        { path: 'test', component: TestPage },
        { path: 'messages', component: MessagesPage, canActivate: [authenticatedGuard, profileCompleteGuard] },
        { path: 'money', component: MoneyPage, canActivate: [authenticatedGuard, profileCompleteGuard] },
        { path: 'profile', component: ProfilePage, canActivate: [authenticatedGuard, profileCompleteGuard] }
    ]}
];
