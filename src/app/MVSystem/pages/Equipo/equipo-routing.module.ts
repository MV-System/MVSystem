import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EquipoRegistroComponent } from './Equipo-registro/equipo-registro.component';

const routes: Routes = [
  {
    path:'equipo-registro',
    component:EquipoRegistroComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EquipoRoutingModule { }
