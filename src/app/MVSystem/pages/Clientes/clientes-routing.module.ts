import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientesRegistroComponent } from './Clientes-registro/clientes-registro.component';
import { ClientesConsultaComponent } from './Clientes-consulta/clientes-consulta.component';
import { CuentasPorCobrarComponent } from './Cuentas-por-cobrar/cuentas-por-cobrar.component';
import { ClientesDetalleComponent } from './Clientes-detalle/clientes-detalle.component';
import { ClientesEditarComponent } from './Clientes-editar/clientes-editar.component';

const routes: Routes = [
  {
    path: '',
    // component: ClientesRegistroComponent,
    children:[
      {
        path: 'registro',
        component: ClientesRegistroComponent,
      },
      {
        path: 'consulta',
        component: ClientesConsultaComponent,
      },

      {
        path: 'cuentasPorCobrar',
        component: CuentasPorCobrarComponent,
      },
      {
        path: 'detalle/:id',
        component: ClientesDetalleComponent,
      },
      {
        path: 'editar/:id',
        component: ClientesEditarComponent,
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientesRoutingModule { }
