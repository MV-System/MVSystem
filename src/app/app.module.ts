
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AuthInterceptorService } from './services/auth-interceptor.service';
import { MvSystemModule } from './MVSystem/mv-system.module';
import { SharedModule } from './shared/shared.module';

import { ToastrModule } from 'ngx-toastr';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    RouterModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    BrowserModule,
    SharedModule,
    ReactiveFormsModule,
    HttpClientModule,
    MvSystemModule,
    ToastrModule.forRoot({
      preventDuplicates: true,
    }),
    AppRoutingModule,

  ],
  exports: [
    SharedModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptorService,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
