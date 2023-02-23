
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MvSystemModule } from './MVSystem/mv-system.module';
import { SharedModule } from './shared/shared.module';

import { ToastrModule } from 'ngx-toastr';
import { AuthInterceptorService } from './core/interceptors/auth-interceptor.service';
import { ErrorHandlerInterceptor } from './core/interceptors/error-handler-interceptor';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    RouterModule,
    BrowserAnimationsModule,
    BrowserModule,
    SharedModule,
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
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },
    {
      provide:HTTP_INTERCEPTORS,
      useClass: ErrorHandlerInterceptor,
      multi:true
    }
],
  bootstrap: [AppComponent]
})
export class AppModule { }
