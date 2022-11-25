import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';


const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    pathMatch:'full'
  },
  {
    path: '',
    loadChildren: () => import('./pages/Auth/auth.module').then( m => m.AuthModule)
   },
  {
    path: 'marcas',
    loadChildren: () => import('./pages/marcas/marcas.module').then( m => m.MarcasModule )
   },
   {
    path: 'modelos',
    loadChildren: () => import('./pages/Modelos/modelos.module').then( m => m.ModelosModule )
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
   {
    path: 'facturacion',
    loadChildren: () => import('./pages/facturacion/facturacion.module').then( m => m.FacturacionModule )
   },
   {
    path: 'equipo',
    loadChildren: () => import('./pages/Equipo/equipo.module').then( m => m.EquipoModule )
   },
   {
    path: 'utilidades',
    loadChildren: () => import('./pages/utilidades/utilidades.module').then( m => m.UtilidadesModule )
   },   
   {
    path: 'cotizacion',
    loadChildren: () => import('./pages/Cotizacion/cotizacion.module').then( m => m.CotizacionModule )
   }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MvSystemRoutingModule { }
