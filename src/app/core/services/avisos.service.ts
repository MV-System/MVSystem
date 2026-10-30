import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Aviso {
  idAviso: number;
  tipo: 'NOVEDAD' | 'AVISO';
  prioridad: 'N' | 'U';
  titulo: string;
  mensaje: string;
  donde: string | null;
  destino: 'TODOS' | 'EMPRESA' | 'USUARIOS';
  destinoValor: string | null;
  permiso: string | null;
  fechaInicio: string;
  fechaVence: string | null;
  activo: boolean;
  creadoPor: string;
  fechaCreacion: string;
  vistos: number;
}

export interface AvisoNuevo {
  tipo: string;
  prioridad: string;
  titulo: string;
  mensaje: string;
  donde?: string;
  destino: string;
  destinoValor?: string;
  permiso?: string;
  fechaInicio?: string | null;
  fechaVence?: string | null;
}

export interface AvisoVisto {
  usuario: string;
  nombreUsuario: string;
  fechaVisto: string;
}

/** Avisos y novedades que se muestran a los usuarios, y su administracion (Seguridad > Avisos) */
@Injectable({
  providedIn: 'root'
})
export class AvisosService {

  private readonly url = `${environment.api}api/Avisos`;
  // Consultar y marcar avisos es silencioso: si falla, el interceptor no muestra errores
  private readonly silencioso = new HttpHeaders({ 'X-Uso-Silencioso': '1' });

  constructor(private http: HttpClient) { }

  pendientes(): Observable<Aviso[]> {
    return this.http.get<Aviso[]>(`${this.url}/Pendientes`, { headers: this.silencioso });
  }

  marcarVistos(ids: number[]): Observable<any> {
    return this.http.post(`${this.url}/Vistos`, { ids }, { headers: this.silencioso });
  }

  listar(): Observable<Aviso[]> {
    return this.http.get<Aviso[]>(this.url);
  }

  crear(aviso: AvisoNuevo): Observable<{ idAviso: number }> {
    return this.http.post<{ idAviso: number }>(this.url, aviso);
  }

  cambiarActivo(id: number, activo: boolean): Observable<any> {
    return this.http.post(`${this.url}/${id}/Activo`, null, { params: { activo: String(activo) } });
  }

  quienLoVio(id: number): Observable<AvisoVisto[]> {
    return this.http.get<AvisoVisto[]>(`${this.url}/${id}/Vistos`);
  }
}
