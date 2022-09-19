import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { AccesoriosRoutingModule } from './accesorios-routing.module';
import { AccesoriosRegistroComponent } from './accesorios-registro/accesorios-registro.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AccesorioConsultaComponent } from './accesorio-consulta/accesorio-consulta.component';

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
    AccesoriosRegistroComponent,
    AccesorioConsultaComponent,
  ],
  imports: [
    CommonModule,
    AccesoriosRoutingModule,
    ReactiveFormsModule,
    CurrencyMaskModule,
    NgSelectModule,
  ],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ],
})
export class AccesoriosModule { }
