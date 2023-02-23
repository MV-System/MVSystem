import jwt_decode from "jwt-decode";
import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { catchError, retry, switchMap } from 'rxjs/operators';
import { HandleErrorsResponseService } from './handle-errors-response.service';
import { LoginDTO, User } from "../core/interfaces/loginDTO.interface";
import { APIURL } from "../config/url";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService implements OnInit{

  constructor(
    private httpClient: HttpClient,
    private handleErrorsRespService: HandleErrorsResponseService,
    private router:Router) { }

  ngOnInit(): void {
    console.log(console.log(localStorage.getItem('expires')));
    
  }
    
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
    console.log(decoded);
    
    return decoded.name
  }
  logout() {
    localStorage.clear();
    this.router.navigate(['/'])
  }
}
