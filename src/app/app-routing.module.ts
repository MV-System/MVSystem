import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './MVSystem/pages/home/home.component';

const routerOptions: ExtraOptions = {
  useHash: true,
}

const routes: Routes = [
  {
    path:'',
    component: HomeComponent
  },
  {
    path: 'mv-system',
    loadChildren: () => import('./MVSystem/mv-system.module').then( m => m.MvSystemModule )
   },
];

@NgModule({
  imports: [RouterModule.forRoot(routes,routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
