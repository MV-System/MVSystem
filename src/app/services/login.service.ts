import jwt_decode from "jwt-decode";
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIURL } from 'src/app/shared/url'
import { LoginDTO, User } from '../MVSystem/interfaces/loginDTO.interface';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private httpClient: HttpClient) { }
  
  public login(userName: string, password: string): Observable<LoginDTO> {
    return this.httpClient.post<LoginDTO>(APIURL.Login.Login, {
      userName,
      password,
    })
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
