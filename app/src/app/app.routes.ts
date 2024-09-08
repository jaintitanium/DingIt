import { Routes } from '@angular/router';
import { LoginPage } from './pages/auth/login/login.page';
import { RootPage } from './pages/main/root/root.page';
import { SignUpPage } from './pages/auth/sign-up/sign-up.page';
import { MessagesPage } from './pages/main/messages/messages.page';
import { MoneyPage } from './pages/main/money/money.page';
import { ProfilePage } from './pages/main/profile/profile.page';
import { profileCompleteGuard } from './guards/profile-complete.guard';
import { CompleteProfilePage } from './pages/complete-profile/complete-profile.page';
import { authenticatedGuard } from './guards/authenticated.guard';
import { SettingsPage } from './pages/settings/settings.page';
import { MainSettingsPage } from './pages/settings/main/main.page';
import { ServiceProviderDetailPage } from './pages/main/service_provider/detail/detail.page';
import { HomePage } from './pages/main/home/home.page';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { splashGuard } from './guards/splash.guard';
import { ServiceProviderPage } from './pages/settings/service-provider/service-provider.page';
import { EditPage } from './pages/settings/service-provider/edit/edit.page';
import { CreatePage } from './pages/settings/service-provider/create/create.page';
import { MenuPage } from './pages/main/service_provider/menu/menu.page';
import { ImageViewPage } from './pages/image/view/view.page';
import { CreateReviewPage } from './pages/main/review/create/create.page';
import { ServiceMemberDetailPage } from './pages/main/service_member/detail/detail.page';
import { ReviewDetailPage } from './pages/main/review/detail/detail.page';
import { ServiceProviderReviewsPage } from './pages/main/service_provider/reviews/reviews.page';
import { ServiceMemberReviewsPage } from './pages/main/service_member/reviews/reviews.page';
import { ServiceProviderTeamPage } from './pages/main/service_provider/team/team.page';
import { FinancialSettingsPage } from './pages/settings/financial/financial.page';
import { RedirectPage } from './pages/auth/redirect/redirect.page';
import { FinancialTransfersPage } from './pages/settings/financial/transfers/transfers.page';
import { UserDetailPage } from './pages/main/user/detail/detail.page';
import { SearchPage } from './pages/main/search/search.page';

export const routes: Routes = [
    { path: 'redirect', component: RedirectPage },
    { path: '', canActivate: [splashGuard], data: {animation: 'b'}, children: [
        { path: 'login', data: {animation: 'login'}, component: LoginPage },
        { path: 'signup', data: {animation: 'signup'}, component: SignUpPage },
        { path: 'complete-profile', data: {animation: 'slide'}, component: CompleteProfilePage },
        { path: 'settings', component: SettingsPage, data: {animation: 'settings'}, canActivate: [authenticatedGuard, profileCompleteGuard], children: [
            { path: 'financial', data: {animation: 'sf'}, component: FinancialSettingsPage },
            { path: 'financial/transfers', data: {animation: 'sft'}, component: FinancialTransfersPage },
            { path: 'service-providers', data: {animation: 'sp'}, component: ServiceProviderPage },
            { path: 'service-providers/create', data: {animation: 'spc'}, component: CreatePage },
            { path: 'service-providers/edit/:id', data: {animation: 'spe'}, component: EditPage },
            { path: '', component: MainSettingsPage, data: { title: "Settings", animation: 's' } },
        ] },
        { path: 'image/:type/:id', data: {animation: 'image'}, component: ImageViewPage },
        { path: '', data: {animation: 'bb'}, component: RootPage, children: [
            { path: 'messages', component: MessagesPage, data: {animation: 'messages'}, canActivate: [authenticatedGuard, profileCompleteGuard] },
            { path: 'money', component: MoneyPage, data: {animation: 'money'}, canActivate: [authenticatedGuard, profileCompleteGuard] },
            { path: 'profile', component: ProfilePage, data: {animation: 'profile'}, canActivate: [authenticatedGuard, profileCompleteGuard] },
            { path: 'service-provider', data: {animation: 'sp'}, children: [
                { path: ':id', data: {animation: 'spid'}, component: ServiceProviderDetailPage },
                { path: ':id/menu', data: {animation: 'spm'}, component: MenuPage },
                { path: ':id/reviews', data: {animation: 'spr'}, component: ServiceProviderReviewsPage },
                { path: ':id/team', data: {animation: 'spt'}, component: ServiceProviderTeamPage }
            ]},
            { path: 'service-member', data: {animation: 'service-member'}, children : [
                { path: ':id', data: {animation: 'sm'}, component: ServiceMemberDetailPage },
                { path: ':id/reviews', data: {animation: 'smr'}, component: ServiceMemberReviewsPage }
            ]},
            { path: 'review', children : [
                { path: ':id', data: {animation: 'r'}, component: ReviewDetailPage },
                { path: 'create/:type/:id', data: {animation: 'rc'}, component: CreateReviewPage, canActivate: [authenticatedGuard, profileCompleteGuard] }
            ]},
            { path: 'user', children : [
                { path: ':id', data: {animation: 'user'}, component: UserDetailPage },
            ]},
            { path: 'search', data: {animation: 'search'}, component: SearchPage },
            { path: '', data: {animation: 'root'}, component: HomePage }
        ]}
    ]},
    { path: 'loading', component: SplashScreenComponent }
];
