import { UtilidadesComponent } from './utilidades-consulta/utilidades.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';



const routes : Routes = [
  {
    path : 'consulta',
    component:UtilidadesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelosRoutingModule { }


export class UtilidadesRoutingModule { }
