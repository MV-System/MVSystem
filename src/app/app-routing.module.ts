import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { DashboardModule } from './MVSystem/pages/dashboard/dashboard/dashboard.module';

const routerOptions: ExtraOptions = {
  useHash: true,
}

const routes: Routes = [
  {
    path: '',
    redirectTo:'login' ,
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./MVSystem/pages/dashboard/dashboard/dashboard.module').then(m => m.DashboardModule),
  },
  {
    path: 'mvSystem',
    loadChildren: () => import('./MVSystem/mv-system.module').then(m => m.MvSystemModule),
  },
  {
     path:'**', component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
