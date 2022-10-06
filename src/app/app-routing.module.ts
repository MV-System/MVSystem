import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './MVSystem/pages/home/home.component';
import { LoginModule } from './MVSystem/pages/login/login.module';
import { LoginComponent } from './MVSystem/pages/login/login/login.component';

const routerOptions: ExtraOptions = {
  useHash: true,
}

const routes: Routes = [
  {
    path: '',
    redirectTo:'login',
    pathMatch:'full',
    component: LoginComponent,
  },
  {
    path: 'mv-system',
    loadChildren: () => import('./MVSystem/mv-system.module').then(m => m.MvSystemModule),
  },
  {
    path: 'login',
    loadChildren: () => import('./MVSystem/pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'dashboard',
    component: HomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
