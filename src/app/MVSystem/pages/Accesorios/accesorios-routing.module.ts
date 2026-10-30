import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccesoriosRegistroComponent } from './accesorios-registro/accesorios-registro.component';
import { AccesorioConsultaComponent } from './accesorio-consulta/accesorio-consulta.component';
import { AccesorioKardexComponent } from './accesorio-kardex/accesorio-kardex.component';
import { ComponentesConsumoComponent } from './componentes-consumo/componentes-consumo.component';

const routes: Routes = [
  {
    path:'registro',
    component: AccesoriosRegistroComponent
  },
  {
    path:'consulta',
    component: AccesorioConsultaComponent
  },
  {
    path:'kardex',
    component: AccesorioKardexComponent
  },
  {
    path:'consumo-componentes',
    component: ComponentesConsumoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccesoriosRoutingModule { }
