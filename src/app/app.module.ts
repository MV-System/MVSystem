
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsDo from '@angular/common/locales/es-DO';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MvSystemModule } from './MVSystem/mv-system.module';
import { SharedModule } from './shared/shared.module';
import { ToastrModule } from 'ngx-toastr';
import { AuthInterceptorService } from './core/interceptors/auth-interceptor.service';
import { ErrorHandlerInterceptor } from './core/interceptors/error-handler-interceptor';
import { NgxPermissionsModule } from 'ngx-permissions';
import { LoginService } from './auth/login.service';
import { DashboardComponent } from './MVSystem/pages/dashboard/dashboard.component';


// Montos (RD$) y fechas en español de República Dominicana en todo el sistema
registerLocaleData(localeEsDo);

// export function initializeAppFactory(Permisos: LoginService) {
//   return () => Permisos.LoadPermisos(); // Retorna una función que llame al método
//}

@NgModule({
  declarations: [
    AppComponent,
    //DashboardComponent

  ],
  imports: [

    RouterModule,
    BrowserAnimationsModule,
    BrowserModule,
    SharedModule,
    HttpClientModule,
    MvSystemModule,
    NgxPermissionsModule.forRoot(),
    ToastrModule.forRoot({
      preventDuplicates: true,
    }),
    AppRoutingModule,

  ],
  exports: [
    SharedModule
  ],

  providers: [
    { provide: LOCALE_ID, useValue: 'es-DO' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'DOP' },
    LoginService, // Asegúrate de que el servicio esté aquí
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,

      multi: true
    },
    {
      provide:HTTP_INTERCEPTORS,
      useClass: ErrorHandlerInterceptor,
      multi:true
    },

],
  bootstrap: [AppComponent]
})
export class AppModule {}
