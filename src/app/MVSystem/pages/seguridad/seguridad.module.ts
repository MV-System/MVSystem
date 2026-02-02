import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeguidadRoutingModule } from './seguridad-routing.module';
import { UsuariosComponent } from './componentes/usuarios/usuarios.component';
import { PermisosComponent } from './componentes/permisos/permisos.component';
import { RolesComponent } from './componentes/roles/roles.component';
import { DepartamentosComponent } from './componentes/departamentos/departamentos.component';
import { ModulosComponent } from './componentes/modulos/modulos.component';
import { SistemasComponent } from './componentes/sistemas/sistemas.component';
import { AsignacionesComponent } from './componentes/asignaciones/asignaciones.component';
import { CambiarClaveComponent } from './componentes/cambiar-clave/cambiar-clave.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { GroupByPipe } from './pipes/group-by.pipe';


@NgModule({
  declarations: [
    UsuariosComponent,
    PermisosComponent,
    RolesComponent,
    DepartamentosComponent,
    ModulosComponent,
    SistemasComponent,
    AsignacionesComponent,
    CambiarClaveComponent,
    GroupByPipe
  ],
  imports: [
    CommonModule,
    SeguidadRoutingModule,
    FormsModule,
    SharedModule,
    HttpClientModule
  ]
})
export class SeguridadModule { }
