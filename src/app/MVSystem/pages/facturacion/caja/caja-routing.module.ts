import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CajaListaComponent } from './caja-lista.component';

const routes: Routes = [
  { path: '', component: CajaListaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CajaRoutingModule {}
