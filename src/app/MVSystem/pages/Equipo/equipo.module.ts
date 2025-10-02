import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { EquipoRoutingModule } from './equipo-routing.module';
import { SharedModule } from '../../../shared/shared.module';

import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskModule } from 'ngx-mask';
import { NgxPaginationModule } from 'ngx-pagination';

import { DirectiveModule } from '../../../core/directives/directives.module';
import { EquipoConsultaComponent } from './Equipo-consulta/equipo-consulta.component';
import { EquipoConsultaRecibidoComponent } from './equipo-consulta-recibido/equipo-consulta-recibido.component';
import { EquipoConsultaVendidoComponent } from './Equipo-consulta/Equipo-consulta-vendido/equipo-consulta-vendido.component';
import { EquipoDisponibleComponent } from './Equipo-consulta/Equipo-consulta-disponible/equipo-disponible.component';
import { EquipoModificacionEstatusComponent } from './Equipo-modificacion-estatus/equipo-modificacion-estatus.component';
import { EquipoRecepcionComponent } from './equipo-recepcion/equipo-recepcion.component';
import { EquipoRegistroComponent } from './Equipo-registro/equipo-registro.component';
import { EquipoTransferenciaComponent } from './equipo-transferencia/equipo-transferencia.component';
import { EquiposConsultaTransferenciasComponent } from './Equipo-consulta/equipos-consulta-transferencias/equipos-consulta-transferencias.component';
import { ReparacionesComponent } from './taller/reparaciones/reparaciones.component';
import { FacturacionModule } from '../facturacion/facturacion.module';
import { ClientesModule } from '../Clientes/clientes.module';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: "left",
  allowNegative: false,
  decimal: ",",
  precision: 2,
  prefix: "RD$ ",
  suffix: "",
  thousands: "."
};
@NgModule({
  declarations: [
    EquipoRegistroComponent,
    EquipoConsultaComponent,
    EquipoConsultaVendidoComponent,
    EquipoDisponibleComponent,
    EquipoModificacionEstatusComponent,
    EquipoTransferenciaComponent,
    EquipoRecepcionComponent,
    EquipoConsultaRecibidoComponent,
    EquiposConsultaTransferenciasComponent,
    ReparacionesComponent
  ],
  imports: [
    CommonModule,
    CurrencyMaskModule,
    EquipoRoutingModule,
    FormsModule,
    MyDateRangePickerModule,
    NgSelectModule,
    NgxMaskModule.forRoot(),
    NgxPaginationModule,
    ReactiveFormsModule,
    SharedModule,
    DirectiveModule,
    FacturacionModule,
    ClientesModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ],
})
export class EquipoModule { }
