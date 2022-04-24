import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxMaskModule } from 'ngx-mask';


import { ClientesRoutingModule } from './clientes-routing.module';
import { ClientesRegistroComponent } from './Clientes-registro/clientes-registro.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ValueArrayPipe } from './pipes/value-array.pipe';


@NgModule({
  declarations: [
    ClientesRegistroComponent,
    ValueArrayPipe,
  ],
  imports: [
    CommonModule,
    ClientesRoutingModule,
    NgxMaskModule.forRoot(),
    ReactiveFormsModule,
  ]
})
export class ClientesModule { }
