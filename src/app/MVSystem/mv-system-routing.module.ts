import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
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
    path: 'mantenimiento',
    loadChildren: () => import('./pages/components/components.module').then( m => m.ComponentsModule )
   },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MvSystemRoutingModule { }
