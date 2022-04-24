import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: 'clientes',
    loadChildren: () => import('./Clientes/clientes.module').then( m => m.ClientesModule )
   },
   {
    path: 'proveedores',
    loadChildren: () => import('./Suplidores/proveedores.module').then( m => m.ProveedoresModule )
   },
   {
    path: 'vendedores',
    loadChildren: () => import('./Vendedores/vendedores.module').then( m => m.VendedoresModule )
   },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MvSystemRoutingModule { }
