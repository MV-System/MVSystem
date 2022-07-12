import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacturacionModule } from './facturacion.module';
import { FacturacionRegistroComponent } from './facturacion-registro/facturacion-registro.component';

const routes: Routes = [
  {
    path:'',
    component: FacturacionRegistroComponent
  }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturacionRoutingModule { }
