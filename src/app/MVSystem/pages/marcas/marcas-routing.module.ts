import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarcasComponent } from './marcas.component';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path:'marcas',
    component:MarcasComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarcasRoutingModule { }
