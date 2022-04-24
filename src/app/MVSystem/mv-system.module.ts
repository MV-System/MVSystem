import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxMaskModule } from 'ngx-mask';


import { ClientesRegistroComponent } from './Clientes/Clientes-registro/clientes-registro.component';
import { MvSystemRoutingModule } from './mv-system-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SuplidorRegistroComponent } from './Suplidores/suplidor-registro/suplidor-registro.component';




@NgModule({
  declarations: [
    ClientesRegistroComponent,
    SuplidorRegistroComponent,
  ],
  imports: [
    CommonModule,
    MvSystemRoutingModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
    

  ]
})
export class MvSystemModule { }
