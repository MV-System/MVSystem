import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from './login/login.component';
import { PasswordChangePageComponent } from './password-change-page/password-change-page.component';
const routes: Routes = [
    {
      path: '',
      redirectTo: 'login',
      pathMatch: 'full',
    },
    {
        path: 'login',
        component:LoginComponent
    },
    {
        path: 'change-password',
        component:PasswordChangePageComponent
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
  })
  export class AuthRoutingModule {}

