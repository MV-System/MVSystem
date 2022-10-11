import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FacturacionRoutingModule } from './facturacion-routing.module';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { FacturacionRegistroComponent } from './facturacion-registro/facturacion-registro.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { NgSelectModule } from '@ng-select/ng-select';
import { DirectiveModule } from '../../../directives/directives.module';
import { FacturacionConsultaComponent } from './facturacion-consulta/facturacion-consulta.component';
import { FacturacionListaComponent } from './facturacion-consulta/facturacion-lista/facturacion-lista.component';

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
    FacturacionRegistroComponent,
    FacturacionConsultaComponent,
    FacturacionListaComponent
  ],
  imports: [
    CommonModule,
    FacturacionRoutingModule,
    CurrencyMaskModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
    NgSelectModule,
    FormsModule,
    DirectiveModule
  ],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ],
})
export class FacturacionModule { }
