import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FacturacionRoutingModule } from './facturacion-routing.module';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { FacturacionRegistroComponent } from './facturacion-registro/facturacion-registro.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { NgSelectModule } from '@ng-select/ng-select';
import { DirectiveModule } from '../../../core/directives/directives.module';
import { FacturacionConsultaComponent } from './facturacion-consulta/facturacion-consulta.component';
import { FacturacionListaComponent } from './facturacion-consulta/facturacion-lista/facturacion-lista.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FacturacionDetailComponent } from './facturacion-consulta/facturacion-detail/facturacion-detail.component';
import { SharedModule } from '../../../shared/shared.module';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { FormClienteComponent } from './facturacion-registro/form-cliente/form-cliente.component';
import { CotizacionListComponent } from './facturacion-registro/cotizacion-list/cotizacion-list.component';

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
    FacturacionListaComponent,
    FacturacionDetailComponent,
    FormClienteComponent,
    CotizacionListComponent
  ],
  imports: [
    CommonModule,
    CurrencyMaskModule,
    DirectiveModule,
    FacturacionRoutingModule,
    FormsModule,
    MyDateRangePickerModule,
    NgSelectModule,
    NgxMaskModule.forRoot(),
    NgxPaginationModule,
    ReactiveFormsModule,
    SharedModule,

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ],
})
export class FacturacionModule { }
