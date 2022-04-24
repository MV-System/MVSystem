import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProveedoresRoutingModule } from './proveedores-routing.module';
import { SuplidorRegistroComponent } from './suplidor-registro/suplidor-registro.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    SuplidorRegistroComponent
  ],
  imports: [
    CommonModule,
    ProveedoresRoutingModule,
    ReactiveFormsModule,

  ]
})
export class ProveedoresModule { }
