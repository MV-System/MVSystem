import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MvSystemRoutingModule } from './mv-system-routing.module';

import { ReactiveFormsModule } from '@angular/forms';
import { ClientesModule } from './pages/Clientes/clientes.module';
import { VendedoresModule } from './pages/Vendedores/vendedores.module';
import { SuplidoresModule } from './pages/Suplidores/suplidores.module';
import { AccesoriosModule } from './pages/Accesorios/accesorios.module';
import { HomeComponent } from './pages/home/home.component';
import { FacturacionComponent } from './pages/facturacion/facturacion/facturacion.component';




@NgModule({
  declarations: [
    HomeComponent,
    FacturacionComponent
  
  ],
  imports: [
    CommonModule,
    MvSystemRoutingModule,
    ReactiveFormsModule,
    SuplidoresModule,
    ClientesModule,
    VendedoresModule,
    AccesoriosModule
  ],
  exports:[
    SuplidoresModule,
    ClientesModule,
    VendedoresModule,
    AccesoriosModule,
    HomeComponent
  ]
})
export class MvSystemModule { }
