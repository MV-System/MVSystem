import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientesRegistroComponent } from './Clientes-registro/clientes-registro.component';
import { ClientesConsultaComponent } from './Clientes-consulta/clientes-consulta.component';

const routes: Routes = [
  {
    path: '',
    // component: ClientesRegistroComponent,
    children:[
      {
        path: 'clientes-registro',
        component: ClientesRegistroComponent,
      },
      {
        path: 'clientes-consulta',
        component: ClientesConsultaComponent,
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientesRoutingModule { }
