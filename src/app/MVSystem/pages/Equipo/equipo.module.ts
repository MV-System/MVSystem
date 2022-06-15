import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EquipoRoutingModule } from './equipo-routing.module';
import { EquipoRegistroComponent } from './Equipo-registro/equipo-registro.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { NgSelectModule } from '@ng-select/ng-select';

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
    EquipoRegistroComponent
  ],
  imports: [
    CommonModule,
    EquipoRoutingModule,
    ReactiveFormsModule,
    CurrencyMaskModule,
    NgSelectModule
  ],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ],
})
export class EquipoModule { }
