import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxMaskModule } from 'ngx-mask';


import { ClientesRegistroComponent } from './Clientes/Clientes-registro/clientes-registro.component';
import { CellControlRoutingModule } from './cell-control-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SuplidorRegistroComponent } from './Suplidores/suplidor-registro/suplidor-registro.component';




@NgModule({
  declarations: [
    ClientesRegistroComponent,
    SuplidorRegistroComponent,
  ],
  imports: [
    CommonModule,
    CellControlRoutingModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot()

  ]
})
export class CellControlModule { }
