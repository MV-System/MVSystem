import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/auth/login.service';
import { LoadingService } from '../../shared/components/r-loading/loading.service';

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
    private router: Router,
    private loadingService:LoadingService) { }

  ngOnInit(): void {

  }
  showAlert: string ="";
  isAlert: boolean =false;
  showPassword:boolean = false;
  isLoading:boolean = false;
  toggleShowPassword(){
    this.showPassword = !this.showPassword;
  }

  iniciarSesion() {
    const {userName, password } =this.loginForm.value;
    // this.loadingService.showLoading('Iniciando sesión');
    this.isLoading =true;
    this.isAlert =false;
    this.loginService.login(userName, password).subscribe(res => {
      console.log(res);
      
      if (!res) {
        // this.toastr.error('Credenciales incorrectas')
        this.showAlert = 'Credenciales incorrectas';
        this.isAlert =true;
        this.isLoading =false;
        return
      }
      localStorage.setItem('token', res.token)
      localStorage.setItem('expires', res.expires.toString())
      // this.toastr.success('Bienvenido!!!');
      this.router.navigateByUrl('/home')
      this.isLoading =false;
    }),(err: any)=>{
      console.log(err);
      this.isLoading =false;
    }
  }
}
