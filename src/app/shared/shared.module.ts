import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RLoadingComponent } from './components/r-loading/r-loading.component';
import { RModalComponent } from './components/r-modal/r-modal.component';
import { MainComponent } from './main/main.component';
import { RDropdownMenuComponent } from './components/r-dropdown-menu/r-dropdown-menu.component';
import { RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RToogleComponent } from './components/r-toogle/r-toogle.component';

@NgModule({
  declarations: [
   
    RLoadingComponent,
    RModalComponent,
    MainComponent,
    RDropdownMenuComponent,
    PageNotFoundComponent,
    RToogleComponent
  ],
  imports: [
    CommonModule,
    RouterModule 
  ],
  exports:[
   
    RLoadingComponent,
    RModalComponent,
    MainComponent,
    RToogleComponent
  ]
})
export class SharedModule { }
