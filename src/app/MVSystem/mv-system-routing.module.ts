import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';


const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'clientes',
    loadChildren: () => import('./pages/Clientes/clientes.module').then( m => m.ClientesModule )
   },
   {
    path: 'suplidores',
    loadChildren: () => import('./pages/Suplidores/suplidores.module').then( m => m.SuplidoresModule )
   },
   {
    path: 'vendedores',
    loadChildren: () => import('./pages/Vendedores/vendedores.module').then( m => m.VendedoresModule )
   },
   {
    path: 'accesorios',
    loadChildren: () => import('./pages/Accesorios/accesorios.module').then( m => m.AccesoriosModule )
   },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MvSystemRoutingModule { }
