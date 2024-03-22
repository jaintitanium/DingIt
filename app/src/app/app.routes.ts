import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { RootPage } from './pages/bar/root/root.page';

export const routes: Routes = [
    { path: 'login', component: LoginPage },
    { path: '', component: RootPage, children: [
        
    ]}
];
