import { UtilidadesComponent } from './utilidades/utilidades.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';



const routes : Routes = [
  {
path : 'utilidades',
component:UtilidadesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelosRoutingModule { }


export class UtilidadesRoutingModule { }
