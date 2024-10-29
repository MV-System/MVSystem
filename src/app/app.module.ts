
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
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
import { NgxPermissionsModule } from 'ngx-permissions';
import { LoginService } from './auth/login.service';
import { DashboardComponent } from './MVSystem/pages/dashboard/dashboard.component';


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
