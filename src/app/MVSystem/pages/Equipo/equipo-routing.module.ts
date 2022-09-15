import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EquipoConsultaComponent } from './Equipo-consulta/equipo-consulta.component';
import { EquipoRegistroComponent } from './Equipo-registro/equipo-registro.component';
import { EquipoTransferenciaComponent } from './equipo-transferencia/equipo-transferencia.component';

const routes: Routes = [
  {
    path:'equipo-registro',
    component:EquipoRegistroComponent
  },
  {
    path:'equipo-consulta',
    component:EquipoConsultaComponent
  },
  {
    path:'equipo-transferencia',
    component:EquipoTransferenciaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EquipoRoutingModule { }
