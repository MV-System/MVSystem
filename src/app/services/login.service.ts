import jwt_decode from "jwt-decode";
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIURL } from 'src/app/shared/url'
import { LoginDTO } from '../MVSystem/interfaces/loginDTO.interface';

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

  public getUserName(): string {

    const token = localStorage.getItem('token')
    if (!token)
      return ''

    var decoded = jwt_decode<LoginDTO>(token);
    return decoded.name
  }
}
