import { UtilidadesModule } from './pages/utilidades/utilidades.module';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MvSystemRoutingModule } from './mv-system-routing.module';

import { ReactiveFormsModule } from '@angular/forms';
import { ClientesModule } from './pages/Clientes/clientes.module';
import { VendedoresModule } from './pages/Vendedores/vendedores.module';
import { SuplidoresModule } from './pages/Suplidores/suplidores.module';
import { AccesoriosModule } from './pages/Accesorios/accesorios.module';
import { HomeComponent } from './pages/home/home.component';
import { EquipoModule } from './pages/Equipo/equipo.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../shared/shared.module';
//import { UtilidadesComponent } from './pages/utilidades/utilidades-consulta/utilidades.component';





@NgModule({
  declarations: [
    HomeComponent,
   // UtilidadesComponent
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
    EquipoModule,
    SharedModule
  ],
  exports: [
    SuplidoresModule,
    ClientesModule,
    VendedoresModule,
    AccesoriosModule,
    EquipoModule,
    HomeComponent,
    UtilidadesModule
  ]
})
export class MvSystemModule { }
