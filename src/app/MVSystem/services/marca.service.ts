import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIURL } from 'src/app/shared/url';
import { MarcaEquipo } from '../interfaces/catalogo.interface';
import { MarcaObjRetorno } from '../interfaces/mantenimiento';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {

  constructor(private http: HttpClient) { }
  postMarca(marca : MarcaEquipo):Observable<MarcaObjRetorno>{
    return this.http.post<MarcaObjRetorno>(APIURL.Marca.Inserta.MarcaInserta, marca);
  }
}
