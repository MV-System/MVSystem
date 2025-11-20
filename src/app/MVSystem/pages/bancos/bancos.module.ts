import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BancosRoutingModule } from './bancos-routing.module';
import { FormsModule } from '@angular/forms';
import { BancosListaComponent } from './bancos-lista/bancos-lista.component';

@NgModule({
  declarations: [BancosListaComponent],
  imports: [CommonModule, BancosRoutingModule, FormsModule],
  exports: [BancosListaComponent]
})
export class BancosModule {}
