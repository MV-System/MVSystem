import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccesoriosComponent } from './accesorios/accesorios.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { AccesoriosRoutingModule } from './accesorios-routing.module';

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
    AccesoriosComponent,
  ],
  imports: [
    CommonModule,
    AccesoriosRoutingModule,
    ReactiveFormsModule,
    CurrencyMaskModule
  ],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
],
})
export class AccesoriosModule { }
