import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { RootPage } from './pages/main/root/root.page';
import { SignUpPage } from './pages/sign-up/sign-up.page';

export const routes: Routes = [
    { path: 'login', component: LoginPage },
    { path: 'signup', component: SignUpPage },
    { path: '', component: RootPage, children: [

    ]}
];
