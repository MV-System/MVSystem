<<<<<<< HEAD
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





@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    MvSystemRoutingModule,
    ReactiveFormsModule,
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
=======
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
import { MarcasComponent } from './pages/marcas/marcas.component';





@NgModule({
  declarations: [
    HomeComponent,
    MarcasComponent
  ],
  imports: [
    CommonModule,
    MvSystemRoutingModule,
    ReactiveFormsModule,
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
>>>>>>> 4f121640941dfd063b132236d128c24c324ba398
