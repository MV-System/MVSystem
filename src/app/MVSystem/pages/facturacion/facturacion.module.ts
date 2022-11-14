import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FacturacionRoutingModule } from './facturacion-routing.module';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { FacturacionRegistroComponent } from './facturacion-registro/facturacion-registro.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { NgSelectModule } from '@ng-select/ng-select';
import { DirectiveModule } from '../../directives/directives.module';
import { FacturacionConsultaComponent } from './facturacion-consulta/facturacion-consulta.component';
import { FacturacionListaComponent } from './facturacion-consulta/facturacion-lista/facturacion-lista.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FacturacionDetailComponent } from './facturacion-consulta/facturacion-detail/facturacion-detail.component';
import { SharedModule } from '../../../shared/shared.module';
import { MyDateRangePickerModule } from 'mydaterangepicker';

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
    FacturacionDetailComponent
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
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ],
})
export class FacturacionModule { }
