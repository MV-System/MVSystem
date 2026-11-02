import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccesoriosRegistroComponent } from './accesorios-registro/accesorios-registro.component';
import { AccesorioConsultaComponent } from './accesorio-consulta/accesorio-consulta.component';

const routes: Routes = [
  {
    path:'registro',
    component: AccesoriosRegistroComponent
  },
  {
    path:'consulta',
    component: AccesorioConsultaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccesoriosRoutingModule { }
