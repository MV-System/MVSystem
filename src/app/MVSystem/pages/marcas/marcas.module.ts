import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarcasRoutingModule } from './marcas-routing.module';
import { MarcasRegistroComponent } from './marcas-facturacion/marcas-registro.component';



@NgModule({
  declarations: [
    MarcasRegistroComponent
  ],
  imports: [
    CommonModule,
    MarcasRoutingModule
  ]
})
export class MarcasModule { }
