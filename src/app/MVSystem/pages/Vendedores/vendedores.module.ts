import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VendedoresRoutingModule } from './vendedores-routing.module';


import { ReactiveFormsModule } from '@angular/forms';
import { VendedorRegistroComponent } from './vendedor-registro/vendedor-registro.component';
import { NgxMaskModule } from 'ngx-mask';


@NgModule({
  declarations: [
    VendedorRegistroComponent
  ],
  imports: [
    CommonModule,
    VendedoresRoutingModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
  ],
  // exports:[
  //   VendedorRegistroComponent

  // ]
})
export class VendedoresModule { }
