import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelosRegistrosComponent } from './modelos-registro/modelos-registros.component';
import { RouterModule, Routes } from '@angular/router';


const routes : Routes = [
  {
path : 'registro',
component:ModelosRegistrosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelosRoutingModule { }
