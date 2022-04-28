import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { SuplidorRegistroComponent } from './suplidor-registro/suplidor-registro.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { SuplidoresRoutingModule } from './suplidores-routing.module';


@NgModule({
  declarations: [
    SuplidorRegistroComponent,
  ],
  imports: [
    CommonModule,
    SuplidoresRoutingModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
  ]
})
export class SuplidoresModule { }
