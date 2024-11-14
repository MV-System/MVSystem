import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxMaskModule } from 'ngx-mask';


import { ClientesRoutingModule } from './clientes-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ClientesRegistroComponent } from './Clientes-registro/clientes-registro.component';
import { ValueArrayPipe } from '../../../core/pipes/value-array.pipe';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { ClientesConsultaComponent } from './Clientes-consulta/clientes-consulta.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { DirectiveModule } from '../../../core/directives/directives.module';
import { FormClienteComponent } from '../facturacion/facturacion-registro/form-cliente/form-cliente.component';

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
  ],
  imports: [
    CommonModule,
    ClientesRoutingModule,
    NgxMaskModule.forRoot(),
    ReactiveFormsModule,
    CurrencyMaskModule,
    NgxPaginationModule,
    DirectiveModule
  ],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ],

})
export class ClientesModule { }
