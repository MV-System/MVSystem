
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AccesoriosModule } from './pages/Accesorios/accesorios.module';
import { ClientesModule } from './pages/Clientes/clientes.module';
import { EquipoModule } from './pages/Equipo/equipo.module';
import { MvSystemRoutingModule } from './mv-system-routing.module';
import { SuplidoresModule } from './pages/Suplidores/suplidores.module';
import { UtilidadesModule } from './pages/utilidades/utilidades.module';
import { VendedoresModule } from './pages/Vendedores/vendedores.module';

import { HomeComponent } from './pages/home/home.component';

import { NgxPaginationModule } from 'ngx-pagination';
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
    EquipoModule
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
