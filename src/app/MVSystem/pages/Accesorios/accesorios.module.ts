import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { AccesoriosRoutingModule } from './accesorios-routing.module';
import { AccesoriosRegistroComponent } from './accesorios-registro/accesorios-registro.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AccesorioConsultaComponent } from './accesorio-consulta/accesorio-consulta.component';
import { AccesorioListComponent } from './accesorio-consulta/accesorio-list/accesorio-list.component';
import { AccesorioEditComponent } from './accesorio-consulta/accesorio-edit/accesorio-edit.component';
import { NgxPaginationModule } from 'ngx-pagination';

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
    AccesorioListComponent,
    AccesorioEditComponent,
  ],
  imports: [
    CommonModule,
    AccesoriosRoutingModule,
    ReactiveFormsModule,
    CurrencyMaskModule,
    NgSelectModule,
    NgxPaginationModule,

  ],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ],
})
export class AccesoriosModule { }
