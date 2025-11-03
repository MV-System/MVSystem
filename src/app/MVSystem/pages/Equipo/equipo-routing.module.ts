import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EquipoConsultaComponent } from './Equipo-consulta/equipo-consulta.component';
import { EquipoRegistroComponent } from './Equipo-registro/equipo-registro.component';
import { EquipoModificacionEstatusComponent } from './Equipo-modificacion-estatus/equipo-modificacion-estatus.component';

import { EquipoRecepcionComponent } from './equipo-recepcion/equipo-recepcion.component';
import { EquipoTransferenciaComponent } from './equipo-transferencia/equipo-transferencia.component';
import { EquipoDisponibleComponent } from './Equipo-consulta/Equipo-consulta-disponible/equipo-disponible.component';
import { EquipoConsultaVendidoComponent } from './Equipo-consulta/Equipo-consulta-vendido/equipo-consulta-vendido.component';
import { EquiposConsultaTransferenciasComponent } from './Equipo-consulta/equipos-consulta-transferencias/equipos-consulta-transferencias.component';
import { ReparacionesComponent } from './taller/reparaciones/reparaciones.component';
import { ReparacionesConsultaComponent } from './taller/reparaciones-consulta/reparaciones-consulta.component';

const routes: Routes = [
  {
    path:'registro',
    component:EquipoRegistroComponent
  },
  {
    path:'consulta',
    component:EquipoConsultaComponent
  },
  {
  path:'Disponible',
  component:EquipoDisponibleComponent
},
{
  path:'Vendidos',
  component:EquipoConsultaVendidoComponent
},
  {
    path:'transferencia',
    component:EquipoTransferenciaComponent
  },
  {
    path:'cambiar-estatus',
    component:EquipoModificacionEstatusComponent
  },
  {
    path:'recepcion',
    component:EquipoRecepcionComponent
  },
  {
    path:'ConsultaTransferencia',
    component:EquiposConsultaTransferenciasComponent
  },
  {
    path:'RegistraReparacion',
    component:ReparacionesComponent
  },
  {
    path:'ConsultaReparaciones',
    component:ReparacionesConsultaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EquipoRoutingModule { }
