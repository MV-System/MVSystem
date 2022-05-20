import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccesoriosRegistroComponent } from './accesorios-registro/accesorios-registro.component';

const routes: Routes = [
  {
    path:'accesorios-registro',
    component: AccesoriosRegistroComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccesoriosRoutingModule { }
