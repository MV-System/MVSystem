// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RLoadingComponent } from './components/r-loading/r-loading.component';
import { RModalComponent } from './components/r-modal/r-modal.component';
import { RDropdownMenuComponent } from './components/r-dropdown-menu/r-dropdown-menu.component';
import { RToggleComponent } from './components/r-toggle/r-toggle.component';
import { RDialogComponent } from './components/r-dialog/r-dialog.component';
import { RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { ReducePipe } from './pipes/reduce.pipe';
import { FilterPipe } from './pipes/filter.pipe';
import { PagoMixtoComponent } from '../MVSystem/pages/facturacion/facturacion-registro/pago-mixto/pago-mixto.component';

@NgModule({
  declarations: [
    MainComponent,  // Declarar MainComponent aquí
    RLoadingComponent,
    RModalComponent,
    RDropdownMenuComponent,
    RToggleComponent,
    RDialogComponent,
    ReducePipe,
    FilterPipe,
    PagoMixtoComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  exports: [
    MainComponent,
    RLoadingComponent,
    RModalComponent,
    RDropdownMenuComponent,
    RToggleComponent,
    RDialogComponent,
    ReducePipe,
    FilterPipe,
    PagoMixtoComponent
  ]
})
export class SharedModule { }
