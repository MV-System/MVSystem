import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacturacionModule } from './facturacion.module';
import { FacturacionRegistroComponent } from './facturacion-registro/facturacion-registro.component';
import { FacturacionConsultaComponent } from './facturacion-consulta/facturacion-consulta.component';

const routes: Routes = [
  {
    path: '',
    component: FacturacionRegistroComponent
  },
  {
    path: 'consulta',
    component: FacturacionConsultaComponent
  },
  {
    path: 'caja',
    loadChildren: () => import('./caja/caja.module').then(m => m.CajaModule)
  }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturacionRoutingModule { }
