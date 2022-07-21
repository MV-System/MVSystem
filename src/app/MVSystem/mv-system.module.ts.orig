
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MvSystemRoutingModule } from './mv-system-routing.module';

import { ReactiveFormsModule } from '@angular/forms';
import { ClientesModule } from './pages/Clientes/clientes.module';
import { VendedoresModule } from './pages/Vendedores/vendedores.module';
import { SuplidoresModule } from './pages/Suplidores/suplidores.module';
import { AccesoriosModule } from './pages/Accesorios/accesorios.module';
import { HomeComponent } from './pages/home/home.component';
import { FacturacionRegistroComponent } from './pages/facturacion/facturacion-registro/facturacion-registro.component';
import { EquipoModule } from './pages/Equipo/equipo.module';
import { ModelosRegistrosComponent } from './pages/Modelos/modelos-registros/modelos-registros.component';
import { NgxPaginationModule } from 'ngx-pagination';





@NgModule({
  declarations: [
    HomeComponent,
    ModelosRegistrosComponent
  ],
  imports: [
    CommonModule,
    MvSystemRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    SuplidoresModule,
    ClientesModule,
    VendedoresModule,
    AccesoriosModule,
    EquipoModule
  ],
  exports:[
    SuplidoresModule,
    ClientesModule,
    VendedoresModule,
    AccesoriosModule,
    EquipoModule,
    HomeComponent
  ]
})
export class MvSystemModule { }
