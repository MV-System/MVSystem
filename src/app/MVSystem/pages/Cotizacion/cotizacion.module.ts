import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { CotizacionRoutingModule } from './cotizacion-routing.module';
import { SharedModule } from '../../../shared/shared.module';

import { CotizacionComponent } from './cotizacion.component';
import { CotizacionListComponent } from './cotizacion-list/cotizacion-list.component';
import { CotizacionConsultaComponent } from './cotizacion-consulta/cotizacion-consulta.component';

import { NgSelectModule } from '@ng-select/ng-select';
import { DirectiveModule } from '../../../core/directives/directives.module';


@NgModule({
  declarations: [
    CotizacionComponent,
    CotizacionListComponent,
    CotizacionConsultaComponent
  ],
  imports: [
    CommonModule,
    CotizacionRoutingModule,
    ReactiveFormsModule,
    NgSelectModule,
    SharedModule,
    DirectiveModule
  ]
})
export class CotizacionModule { }
