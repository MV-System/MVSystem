import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EquipoConsultaTransferenciaRoutingModule } from './equipo-consulta-transferencia-routing.module';
import { ConsultaComponent } from './consulta/consulta.component';


@NgModule({
  declarations: [
    ConsultaComponent
  ],
  imports: [
    CommonModule,
    EquipoConsultaTransferenciaRoutingModule
  ]
})
export class EquipoConsultaTransferenciaModule { }
