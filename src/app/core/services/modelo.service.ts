import { ModeloEquipo } from '../interfaces/catalogo.interface';
import { Injectable } from '@angular/core';
import { ModeloObjRetorno } from '../interfaces/mantenimiento';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APIURL } from 'src/app/config/url';

@Injectable({
  providedIn: 'root'
})
export class ModeloService {

  constructor(private http: HttpClient) { }
  postModelo(modelo : ModeloEquipo):Observable<ModeloObjRetorno>{
    return this.http.post<ModeloObjRetorno>(APIURL.Modelo.Inserta.ModeloInserta, modelo);
  }
}
