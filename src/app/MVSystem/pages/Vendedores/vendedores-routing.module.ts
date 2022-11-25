import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendedorRegistroComponent } from './vendedor-registro/vendedor-registro.component';


const routes: Routes = [
  {
    path:'registro',
    component: VendedorRegistroComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendedoresRoutingModule { }
