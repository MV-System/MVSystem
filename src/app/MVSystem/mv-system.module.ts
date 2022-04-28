import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MvSystemRoutingModule } from './mv-system-routing.module';

import { ReactiveFormsModule } from '@angular/forms';
import { ClientesModule } from './pages/Clientes/clientes.module';
import { VendedoresModule } from './pages/Vendedores/vendedores.module';
import { SuplidoresModule } from './pages/Suplidores/suplidores.module';




@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    MvSystemRoutingModule,
    ReactiveFormsModule,
    SuplidoresModule,
    ClientesModule,
    VendedoresModule
  ],
  exports:[
    SuplidoresModule,
    ClientesModule,
    VendedoresModule
  ]
})
export class MvSystemModule { }
