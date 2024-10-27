import { UtilidadesComponent } from './utilidades-consulta/utilidades.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: 'consulta', // Esta es la ruta que se accede después de '/utilidades'
    component: UtilidadesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UtilidadesRoutingModule { }
