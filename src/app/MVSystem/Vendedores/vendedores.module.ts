import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VendedoresRoutingModule } from './vendedores-routing.module';
import { VendedorRegistroComponent } from './vendedor-registro/vendedor-registro.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    VendedorRegistroComponent
  ],
  imports: [
    CommonModule,
    VendedoresRoutingModule,
    ReactiveFormsModule
  ]
})
export class VendedoresModule { }
