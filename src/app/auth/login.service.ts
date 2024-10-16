import jwt_decode from "jwt-decode";
import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { catchError, retry, switchMap } from 'rxjs/operators';
import { HandleErrorsResponseService } from '../services/handle-errors-response.service';
import { LoginDTO, User } from "../core/interfaces/loginDTO.interface";
import { APIURL } from "../config/url";
import { Router } from '@angular/router';
import { CatalogosService } from '../core/services/catalogos.service';
import { Almacen } from '../core/interfaces/catalogo.interface';
import { currentDate, transformDate } from "../helpers/helper";
import { NgxPermissionsService } from "ngx-permissions";
interface userToken{
  Empresa:string,
  aud:string,
  exp:number,
  given_name:string,
  idSucursal:string,
  iss:string,
  jti:string,
  name:string,
  nameid:string,
  role:string[],
}
@Injectable({
  providedIn: 'root'
})
export class LoginService implements OnInit{

  constructor(
    private httpClient: HttpClient,
    private handleErrorsRespService: HandleErrorsResponseService,
    private router:Router,
    private permisosService: NgxPermissionsService) { }

  ngOnInit(): void {
let a = this.tokenDecoded();
    this.permisosService.loadPermissions(this.tokenDecoded.role);}


    LoadPermisos(): void {
      return this.tokenDecoded.name
    }

  isPrint = new Subject<boolean>();

  get tokenDecoded(){
    let token = localStorage.getItem('token') ;
    if(!token) return ''

   //console.log("Ver Permisos", jwt_decode<any>(`${token}`));

    return jwt_decode<any>(`${token}`) ;
  }
  // public LoadPermisos(): void {
  //  return console.log("Holaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
  //   //return this.permisosService.loadPermissions(this.tokenDecoded.role);
  // }

  get getUserIdSucursal(): string {
    //console.log("Holaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1");
    return this.tokenDecoded.idSucursal
  }

  get getUserId(): string {
    return this.tokenDecoded.nameid
  }
  get getUserEmpresa(): string {
    return this.tokenDecoded.Empresa
  }
  public getUserName(): string {
    return this.tokenDecoded.name
  }
  public getUserGiveName(): string {
    return this.tokenDecoded.given_name
  }
  public login(userName: string, password: string): Observable<LoginDTO> {
    return this.httpClient.post<LoginDTO>(APIURL.Login.Login, {
      userName,
      password,
    })
    .pipe(
      retry(2),
      catchError(this.handleErrorsRespService.handleError)
    )
  }
  public getUserRoles(): string[] {
    //this.permisosService.loadPermissions(this.tokenDecoded.role)
    //console.log("Ver Permisos", this.permisosService.loadPermissions(this.tokenDecoded.role));
    return this.tokenDecoded.role
  }
  changePwdUser( user: User ){
    user.codigo =Number(this.getUserId);
    user.login = this.getUserName();
    return this.httpClient.post(APIURL.Login.ChangePassword,user)
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/'])
  }
}
