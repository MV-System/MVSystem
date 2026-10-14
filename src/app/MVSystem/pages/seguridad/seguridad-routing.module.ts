import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsuariosComponent } from './componentes/usuarios/usuarios.component';
import { PermisosComponent } from './componentes/permisos/permisos.component';
import { RolesComponent } from './componentes/roles/roles.component';
import { DepartamentosComponent } from './componentes/departamentos/departamentos.component';
import { ModulosComponent } from './componentes/modulos/modulos.component';
import { SistemasComponent } from './componentes/sistemas/sistemas.component';
import { AsignacionesComponent } from './componentes/asignaciones/asignaciones.component';
import { CambiarClaveComponent } from './componentes/cambiar-clave/cambiar-clave.component';
import { GestionarEquipoComponent } from './componentes/gestionar-equipo/gestionar-equipo.component';

const routes: Routes = [
  {
    path: 'usuarios',
    component: UsuariosComponent
  },
  {
    path: 'permisos',
    component: PermisosComponent
  },
  {
    path: 'roles',
    component: RolesComponent
  },
  {
    path: 'departamentos',
    component: DepartamentosComponent
  },
  {
    path: 'modulos',
    component: ModulosComponent
  },
  {
    path: 'sistemas',
    component: SistemasComponent
  },
  {
    path: 'asignaciones',
    component: AsignacionesComponent
  },
  {
    path: 'cambiar-clave',
    component: CambiarClaveComponent
  },
  {
    path: 'gestionar-equipo',
    component: GestionarEquipoComponent
  },
  {
    path: 'eliminar-equipo',
    redirectTo: 'gestionar-equipo',
    pathMatch: 'full'
  },
  {
    path: '',
    redirectTo: 'usuarios',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SeguidadRoutingModule { }
