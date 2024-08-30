import { Routes } from '@angular/router';
import { LoginPage } from './pages/auth/login/login.page';
import { RootPage } from './pages/main/root/root.page';
import { SignUpPage } from './pages/auth/sign-up/sign-up.page';
import { TestPage } from './pages/main/test/test.page';
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
    { path: '', canActivate: [splashGuard], children: [
        { path: 'login', component: LoginPage },
        { path: 'signup', component: SignUpPage },
        { path: 'complete-profile', component: CompleteProfilePage },
        { path: 'settings', component: SettingsPage, canActivate: [authenticatedGuard, profileCompleteGuard], children: [
            { path: 'financial', component: FinancialSettingsPage },
            { path: 'financial/transfers', component: FinancialTransfersPage },
            { path: 'service-providers', component: ServiceProviderPage },
            { path: 'service-providers/create', component: CreatePage },
            { path: 'service-providers/edit/:id', component: EditPage },
            { path: '', component: MainSettingsPage, data: { title: "Settings" } },
        ] },
        { path: 'image/:type/:id', component: ImageViewPage },
        { path: '', component: RootPage, children: [
            { path: 'test', component: TestPage },
            { path: 'messages', component: MessagesPage, canActivate: [authenticatedGuard, profileCompleteGuard] },
            { path: 'money', component: MoneyPage, canActivate: [authenticatedGuard, profileCompleteGuard] },
            { path: 'profile', component: ProfilePage, canActivate: [authenticatedGuard, profileCompleteGuard] },
            { path: 'service-provider', children: [
                { path: ':id', component: ServiceProviderDetailPage },
                { path: ':id/menu', component: MenuPage },
                { path: ':id/reviews', component: ServiceProviderReviewsPage },
                { path: ':id/team', component: ServiceProviderTeamPage }
            ]},
            { path: 'service-member', children : [
                { path: ':id', component: ServiceMemberDetailPage },
                { path: ':id/reviews', component: ServiceMemberReviewsPage }
            ]},
            { path: 'review', children : [
                { path: ':id', component: ReviewDetailPage },
                { path: 'create/:type/:id', component: CreateReviewPage, canActivate: [authenticatedGuard, profileCompleteGuard] }
            ]},
            { path: 'user', children : [
                { path: ':id', component: UserDetailPage },
            ]},
            { path: 'search', component: SearchPage },
            { path: '', component: HomePage }
        ]}
    ]},
    { path: 'loading', component: SplashScreenComponent }
];
