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
    this.LoadPermisos(); // Llama a LoadPermisos cuando se inicie el componente
  }
    LoadPermisos(): void {
      const tokenData = this.tokenDecoded;
      if (tokenData && tokenData.role) {
         this.permisosService.loadPermissions(tokenData.role);
    } else {
        console.error('No se pudo obtener el token o el rol.');
    }
  }

  isPrint = new Subject<boolean>();

  get tokenDecoded1(){

    let token = localStorage.getItem('token') ;


    if(!token) return ''

    return jwt_decode<any>(`${token}`) ;
  }

  get tokenDecoded(){

    let token = localStorage.getItem('token') ;
    //const token = localStorage.getItem('token');

    if (!token) {
        console.error('No se encontró el token en localStorage.');
        return ''; // Cambia el retorno a null para evitar errores
    }

    try {
        return jwt_decode<any>(token); // Decodifica el token correctamente
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null; // En caso de error, devuelve null
    }
   }

  get getUserIdSucursal(): string {
    return this.tokenDecoded.idSucursal
  }

  get getUserId(): string {
    return this.tokenDecoded.nameid
  }
  get getUserEmpresa(): string {
    return this.tokenDecoded.Empresa
  }
  get getUserEmpresaMostrar(): string {
    return this.tokenDecoded.NombreEmpresaMostrar
  }
  get getUserIdEmpresa(): string {
    return this.tokenDecoded.IdEmpresa
  }
  get isCertificado(): boolean {
    const val = this.tokenDecoded?.Certificado;
    return val === true || val === 'True' || val === 'true';
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
    const roles = this.tokenDecoded?.role;
    if (Array.isArray(roles)) return roles;
    return typeof roles === 'string' && roles.length > 0 ? [roles] : [];
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
