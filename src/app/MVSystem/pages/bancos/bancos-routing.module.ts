import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BancosListaComponent } from './bancos-lista/bancos-lista.component';

const routes: Routes = [
  {
    path: '',
    component: BancosListaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BancosRoutingModule {}
