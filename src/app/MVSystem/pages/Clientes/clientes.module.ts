import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxMaskModule } from 'ngx-mask';


import { ClientesRoutingModule } from './clientes-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientesRegistroComponent } from './Clientes-registro/clientes-registro.component';
import { ValueArrayPipe } from '../../../core/pipes/value-array.pipe';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { ClientesConsultaComponent } from './Clientes-consulta/clientes-consulta.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { DirectiveModule } from '../../../core/directives/directives.module';
import { CuentasPorCobrarComponent } from './Cuentas-por-cobrar/cuentas-por-cobrar.component';
import { ClientesDetalleComponent } from './Clientes-detalle/clientes-detalle.component';
import { ClientesEditarComponent } from './Clientes-editar/clientes-editar.component';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/shared/shared.module';

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
  declarations:[
    ClientesRegistroComponent,
    ValueArrayPipe,
    ClientesConsultaComponent,
    CuentasPorCobrarComponent,
    ClientesDetalleComponent,
    ClientesEditarComponent,
  ],
  imports: [
    CommonModule,
    ClientesRoutingModule,
    NgxMaskModule.forRoot(),
    ReactiveFormsModule,
    CurrencyMaskModule,
    MyDateRangePickerModule,
    FormsModule,
    NgxPaginationModule,
    DirectiveModule,
    NgSelectModule,
    SharedModule,
  ],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    ClientesRegistroComponent
  ]
})
export class ClientesModule { }
