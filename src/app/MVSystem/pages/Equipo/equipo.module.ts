import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EquipoRoutingModule } from './equipo-routing.module';
import { EquipoRegistroComponent } from './Equipo-registro/equipo-registro.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { NgSelectModule } from '@ng-select/ng-select';
import { EquipoConsultaComponent } from './Equipo-consulta/equipo-consulta.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { EquipoConsultaVendidoComponent } from './Equipo-consulta/Equipo-consulta-vendido/equipo-consulta-vendido.component';
import { EquipoDisponibleComponent } from './Equipo-consulta/Equipo-consulta-disponible/equipo-disponible.component';
import { SharedModule } from '../../../shared/shared.module';
import { NgxMaskModule } from 'ngx-mask';

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
    EquipoDisponibleComponent
  ],
  imports: [
    CommonModule,
    EquipoRoutingModule,
    ReactiveFormsModule,
    CurrencyMaskModule,
    NgSelectModule,
    NgxPaginationModule,
    NgxMaskModule.forRoot(),
    MyDateRangePickerModule,
    SharedModule,
    FormsModule
  ],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ],
})
export class EquipoModule { }
