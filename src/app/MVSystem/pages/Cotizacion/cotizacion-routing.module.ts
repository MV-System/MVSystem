import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CotizacionComponent } from './cotizacion.component';
import { CotizacionConsultaComponent } from './cotizacion-consulta/cotizacion-consulta.component';

const routes: Routes = [
  {
    path: 'consulta', component: CotizacionConsultaComponent
  },
  {
    path:'', component: CotizacionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CotizacionRoutingModule { }
