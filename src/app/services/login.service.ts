import jwt_decode from "jwt-decode";
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { catchError, retry, switchMap } from 'rxjs/operators';
import { HandleErrorsResponseService } from './handle-errors-response.service';
import { LoginDTO, User } from "../core/interfaces/loginDTO.interface";
import { APIURL } from "../config/url";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private httpClient: HttpClient,
    private handleErrorsRespService: HandleErrorsResponseService) { }
    
    isPrint = new Subject<boolean>();

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

  changePwdUser( user: User ){
    user.codigo =Number(this.getUserId);
    user.login = this.getUserName();
    return this.httpClient.post(APIURL.Login.ChangePassword,user)
  }
  get getUserId(): string {
    const token = localStorage.getItem('token')
    if (!token) return ''
    let decoded = jwt_decode<LoginDTO>(token);
    return decoded.nameid
  }
  public getUserName(): string {

    const token = localStorage.getItem('token')
    if (!token)
      return ''

    var decoded = jwt_decode<LoginDTO>(token);
    return decoded.name
  }
}
