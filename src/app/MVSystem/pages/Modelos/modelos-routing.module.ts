import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModelosRegistrosComponent } from './modelos-registro/modelos-registros.component';

const routes : Routes = [
  {
    path : 'registro',
    component: ModelosRegistrosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelosRoutingModule { }
