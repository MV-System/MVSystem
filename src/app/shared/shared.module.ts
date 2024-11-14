// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RLoadingComponent } from './components/r-loading/r-loading.component';
import { RModalComponent } from './components/r-modal/r-modal.component';
import { RDropdownMenuComponent } from './components/r-dropdown-menu/r-dropdown-menu.component';
import { RToggleComponent } from './components/r-toggle/r-toggle.component';
import { RDialogComponent } from './components/r-dialog/r-dialog.component';
import { RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';

@NgModule({
  declarations: [
    MainComponent,  // Declarar MainComponent aquí
    RLoadingComponent,
    RModalComponent,
    RDropdownMenuComponent,
    RToggleComponent,
    RDialogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    MainComponent,
    RLoadingComponent,
    RModalComponent,
    RDropdownMenuComponent,
    RToggleComponent,
    RDialogComponent
  ]
})
export class SharedModule { }
