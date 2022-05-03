import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MvSystemRoutingModule } from './mv-system-routing.module';

import { ReactiveFormsModule } from '@angular/forms';
import { ClientesModule } from './pages/Clientes/clientes.module';
import { VendedoresModule } from './pages/Vendedores/vendedores.module';
import { SuplidoresModule } from './pages/Suplidores/suplidores.module';
import { ComponentsModule } from './pages/components/components.module';




@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    MvSystemRoutingModule,
    ReactiveFormsModule,
    SuplidoresModule,
    ClientesModule,
    VendedoresModule,
    ComponentsModule
  ],
  exports:[
    SuplidoresModule,
    ClientesModule,
    VendedoresModule,
    ComponentsModule
  ]
})
export class MvSystemModule { }
