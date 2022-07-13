import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarcasRegistroComponent } from './marcas-registro/marcas-registro.component';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path:'marcas-registro',
    component:MarcasRegistroComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarcasRoutingModule { }
