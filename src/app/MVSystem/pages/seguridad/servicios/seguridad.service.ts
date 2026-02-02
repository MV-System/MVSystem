import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SeguridadService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Usuarios
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/usuarios`, { headers: this.getHeaders() });
  }

  getUsuarioPorCodigo(codigo: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/usuarios/${codigo}`, { headers: this.getHeaders() });
  }

  crearUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios`, usuario, { headers: this.getHeaders() });
  }

  actualizarUsuario(usuario: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/usuarios/${usuario.codigo}`, usuario, { headers: this.getHeaders() });
  }

  eliminarUsuario(codigo: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/usuarios/${codigo}`, { headers: this.getHeaders() });
  }

  eliminarUsuarioCompletamente(codigo: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/usuarios/${codigo}/eliminar`, { headers: this.getHeaders() });
  }

  desactivarUsuario(codigo: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/usuarios/${codigo}`, { headers: this.getHeaders() });
  }

  activarUsuario(codigo: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios/${codigo}/activar`, {}, { headers: this.getHeaders() });
  }

  cambiarContrasenaAdmin(codigo: number, nuevaContrasena: string): Observable<any> {
    const payload = { nuevaContrasena };
    return this.http.post(`${this.baseUrl}/usuarios/${codigo}/reset-contrasena`, payload, { headers: this.getHeaders() });
  }

  cambiarContraseñaUsuario(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios/cambiar-contrasena`, payload, { headers: this.getHeaders() });
  }

  // Permisos
  getPermisos(): Observable<any[]> {
    // Agregar timestamp para evitar caché del navegador
    const params = new HttpParams().set('_t', new Date().getTime().toString());
    return this.http.get<any[]>(`${this.baseUrl}/permisos`, { headers: this.getHeaders(), params });
  }

  getPermisoPorCodigo(codigo: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/permisos/${codigo}`, { headers: this.getHeaders() });
  }

  crearPermiso(permiso: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/permisos`, permiso, { headers: this.getHeaders() });
  }

  actualizarPermiso(permiso: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/permisos/${permiso.codigo}`, permiso, { headers: this.getHeaders() });
  }

  eliminarPermiso(codigo: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/permisos/${codigo}`, { headers: this.getHeaders() });
  }

  // Roles
  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/roles`, { headers: this.getHeaders() });
  }

  getRolPorCodigo(codigo: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/roles/${codigo}`, { headers: this.getHeaders() });
  }

  crearRol(rol: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/roles`, rol, { headers: this.getHeaders() });
  }

  actualizarRol(rol: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/roles`, rol, { headers: this.getHeaders() });
  }

  eliminarRol(codigo: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/roles/${codigo}`, { headers: this.getHeaders() });
  }

  // Perfiles
  getPerfiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/perfiles`, { headers: this.getHeaders() });
  }

  // Departamentos
  getDepartamentos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/departamentos`, { headers: this.getHeaders() });
  }

  getDepartamentoPorCodigo(codigo: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/departamentos/${codigo}`, { headers: this.getHeaders() });
  }

  crearDepartamento(depto: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/departamentos`, depto, { headers: this.getHeaders() });
  }

  actualizarDepartamento(depto: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/departamentos`, depto, { headers: this.getHeaders() });
  }

  eliminarDepartamento(codigo: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/departamentos/${codigo}`, { headers: this.getHeaders() });
  }

  // Módulos
  getModulos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/modulos`, { headers: this.getHeaders() });
  }

  getModuloPorCodigo(codigo: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/modulos/${codigo}`, { headers: this.getHeaders() });
  }

  crearModulo(modulo: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/modulos`, modulo, { headers: this.getHeaders() });
  }

  actualizarModulo(modulo: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/modulos`, modulo, { headers: this.getHeaders() });
  }

  eliminarModulo(codigo: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/modulos/${codigo}`, { headers: this.getHeaders() });
  }

  // Sistemas
  getSistemas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sistemas`, { headers: this.getHeaders() });
  }

  getSistemaPorCodigo(codigo: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sistemas/${codigo}`, { headers: this.getHeaders() });
  }

  crearSistema(sistema: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/sistemas`, sistema, { headers: this.getHeaders() });
  }

  actualizarSistema(sistema: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/sistemas`, sistema, { headers: this.getHeaders() });
  }

  eliminarSistema(codigo: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/sistemas/${codigo}`, { headers: this.getHeaders() });
  }

  // Asignaciones
  obtenerPermisosEfectivos(codigoUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/asignaciones/permisos-efectivos/${codigoUsuario}`, { headers: this.getHeaders() });
  }

  obtenerPermisosDirectos(codigoUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/asignaciones/permisos-directos/${codigoUsuario}`, { headers: this.getHeaders() });
  }

  obtenerPermisosHeredados(codigoUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/asignaciones/permisos-heredados/${codigoUsuario}`, { headers: this.getHeaders() });
  }

  asignarPermisosUsuario(codigoUsuario: number, permisosIds: number[]): Observable<any> {
    const payload = {
      codigoUsuario: codigoUsuario,
      permisosIds: permisosIds
    };
    return this.http.post(`${this.baseUrl}/asignaciones/asignar-permisos`, payload, { headers: this.getHeaders() });
  }

  modificarPermisosUsuario(codigoUsuario: number, permisosIds: number[]): Observable<any> {
    const payload = {
      codigoUsuario: codigoUsuario,
      permisosIds: permisosIds
    };
    const url = `${this.baseUrl}/asignaciones/modificar-permisos`;
    console.log('🔍 Modificar Permisos - URL:', url);
    console.log('🔍 Payload:', payload);
    return this.http.put(url, payload, { headers: this.getHeaders() });
  }

  desasignarPermisoUsuario(codigoUsuario: number, codigoPermiso: number): Observable<any> {
    const payload = {
      codigoUsuario: codigoUsuario,
      codigoPermiso: codigoPermiso
    };
    return this.http.post(`${this.baseUrl}/asignaciones/desasignar-permiso`, payload, { headers: this.getHeaders() });
  }

  usuarioTienePermiso(codigoUsuario: number, codigoPermiso: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/asignaciones/usuario-tiene-permiso/${codigoUsuario}/${codigoPermiso}`, { headers: this.getHeaders() });
  }
}
