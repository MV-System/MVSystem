import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup = this.fb.group({
    userName: [''],
    password: [''],
  })

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loginService: LoginService,
    private router: Router) { }

  ngOnInit(): void {

  }
  isPrint: boolean = false;
  showPassword = false;
  toggleShowPassword(){
    this.showPassword = !this.showPassword;
  }

  IniciarSesion() {
    this.isPrint = !this.isPrint;

    this.loginService.login(this.loginForm.get('userName')?.value, this.loginForm.get('password')?.value).subscribe(res => {
      console.log(res);
      

      if (!res) {
        this.toastr.error('Credenciales incorrectas')
        this.isPrint = !this.isPrint;

        return
      }

      localStorage.setItem('token', res.token)
      localStorage.setItem('expires', res.expires.toString())
      this.toastr.success('Bienvenido!!!');
      this.router.navigateByUrl('/home')
      this.isPrint = !this.isPrint;

    })
  }
}
