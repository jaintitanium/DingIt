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
import { SettingsPage } from './pages/settings/settings.page';
import { AccountSettingsPage } from './pages/settings/account/account.page';
import { MainSettingsPage } from './pages/settings/main/main.page';
import { DetailPage } from './pages/main/service_provider/detail/detail.page';
import { HomePage } from './pages/main/home/home.page';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { splashGuard } from './guards/splash.guard';
import { ServiceProviderPage } from './pages/settings/service-provider/service-provider.page';
import { EditPage } from './pages/settings/service-provider/edit/edit.page';
import { CreatePage } from './pages/settings/service-provider/create/create.page';
import { MenuPage } from './pages/main/service_provider/menu/menu.page';

export const routes: Routes = [
    { path: '', canActivate: [splashGuard], children: [
        { path: 'login', component: LoginPage },
        { path: 'signup', component: SignUpPage },
        { path: 'complete-profile', component: CompleteProfilePage },
        { path: 'settings', component: SettingsPage, canActivate: [authenticatedGuard, profileCompleteGuard], children: [
            { path: 'account', component: AccountSettingsPage },
            { path: 'service-providers', component: ServiceProviderPage },
            { path: 'service-providers/create', component: CreatePage },
            { path: 'service-providers/edit/:id', component: EditPage },
            { path: '', component: MainSettingsPage, data: { title: "Settings" } },
        ] },
        { path: '', component: RootPage, children: [
            { path: 'test', component: TestPage },
            { path: 'messages', component: MessagesPage, canActivate: [authenticatedGuard, profileCompleteGuard] },
            { path: 'money', component: MoneyPage, canActivate: [authenticatedGuard, profileCompleteGuard] },
            { path: 'profile', component: ProfilePage, canActivate: [authenticatedGuard, profileCompleteGuard] },
            { path: 'service-provider', children: [
                { path: ':id', component: DetailPage },
                { path: ':id/menu', component: MenuPage }
            ]},
            { path: '', component: HomePage }
        ]}
    ]},
    { path: 'loading', component: SplashScreenComponent }
];
