import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './MVSystem/pages/home/home.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';

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
    path: 'utilidades',
    loadChildren: () => import('./MVSystem/pages/utilidades/utilidades.module').then(m => m.UtilidadesModule),

    //  path: 'mv-system',
    //  loadChildren: () => import('./MVSystem/mv-system.module').then(m => m.MvSystemModule),
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
