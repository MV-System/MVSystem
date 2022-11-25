import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { RLoadingComponent } from './components/r-loading/r-loading.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RModalComponent } from './components/r-modal/r-modal.component';
import { MainComponent } from './main/main.component';
import { RDropdownMenuComponent } from './components/r-dropdown-menu/r-dropdown-menu.component';
import { RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    RLoadingComponent,
    RModalComponent,
    SidebarComponent,
    MainComponent,
    RDropdownMenuComponent,
    PageNotFoundComponent
  ],
  imports: [
    CommonModule,
    RouterModule 
  ],
  exports:[
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    RLoadingComponent,
    RModalComponent,
    MainComponent
  ]
})
export class SharedModule { }
