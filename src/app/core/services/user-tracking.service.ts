import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginService } from '../../auth/login.service';

/**
 * Interfaz para el DTO de tracking
 */
export interface TrackingLogDto {
  usuario: string;
  modulo: string;
  accion: string;
  metadata?: string;
}

/**
 * Interfaz para la respuesta del API
 */
export interface TrackingResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Servicio para rastrear interacciones del usuario
 * Envía logs al backend para monitoreo y notificaciones WhatsApp
 */
@Injectable({
  providedIn: 'root'
})
export class UserTrackingService {

  private apiUrl = `${environment.api}api/tracking`;
  private isEnabled = true; // Puedes desactivar el tracking globalmente

  constructor(
    private http: HttpClient,
    private loginService: LoginService
  ) { }

  /**
   * Registra el acceso a un módulo
   * @param moduleName Nombre del módulo (ej: 'Dashboard IA', 'Equipos Disponibles')
   * @param action Acción realizada (por defecto 'PageView')
   * @param metadata Metadata adicional (opcional)
   * @param userName Nombre del usuario (opcional, se puede obtener del LoginService)
   */
  trackPageView(moduleName: string, action: string = 'PageView', metadata?: any, userName?: string): Observable<TrackingResponse> {
    if (!this.isEnabled) return of({ success: false, message: 'Tracking deshabilitado' });

    const log: TrackingLogDto = {
      usuario: userName || this.getCurrentUser(),
      modulo: moduleName,
      accion: action,
      metadata: metadata ? JSON.stringify({
        ...metadata,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }) : JSON.stringify({
        url: window.location.href,
        timestamp: new Date().toISOString()
      })
    };

    return this.sendLog(log);
  }

  /**
   * Registra una acción específica del usuario
   * @param module Módulo donde ocurre la acción
   * @param action Acción realizada (ej: 'Crear', 'Editar', 'Eliminar', 'Exportar')
   * @param metadata Datos adicionales de la acción
   * @param userName Usuario que realiza la acción (opcional)
   */
  trackAction(
    module: string,
    action: string,
    metadata?: any,
    userName?: string
  ): Observable<TrackingResponse> {
    if (!this.isEnabled) return of({ success: false, message: 'Tracking deshabilitado' });

    const log: TrackingLogDto = {
      usuario: userName || this.getCurrentUser(),
      modulo: module,
      accion: action,
      metadata: metadata ? JSON.stringify(metadata) : undefined
    };

    return this.sendLog(log);
  }

  /**
   * Registra un click en un botón importante
   * @param buttonName Nombre del botón
   * @param moduleName Módulo donde está el botón
   * @param metadata Datos adicionales
   */
  trackButtonClick(
    buttonName: string,
    moduleName: string,
    metadata?: any
  ): void {
    this.trackAction(
      moduleName,
      `Click: ${buttonName}`,
      metadata
    );
  }

  /**
   * Registra una búsqueda o filtro aplicado
   * @param moduleName Módulo donde se realizó la búsqueda
   * @param searchTerm Término buscado
   * @param filters Filtros aplicados
   */
  trackSearch(
    moduleName: string,
    searchTerm: string,
    filters?: any
  ): void {
    this.trackAction(
      moduleName,
      'Búsqueda',
      {
        searchTerm,
        filters,
        timestamp: new Date().toISOString()
      }
    );
  }

  /**
   * Registra la exportación de datos
   * @param moduleName Módulo desde donde se exporta
   * @param format Formato de exportación (PDF, Excel, etc.)
   * @param recordCount Cantidad de registros exportados
   */
  trackExport(
    moduleName: string,
    format: string,
    recordCount?: number
  ): void {
    this.trackAction(
      moduleName,
      `Exportar ${format}`,
      {
        format,
        recordCount,
        timestamp: new Date().toISOString()
      }
    );
  }

  /**
   * Registra un error o excepción
   * @param moduleName Módulo donde ocurrió el error
   * @param errorMessage Mensaje de error
   * @param errorDetails Detalles adicionales del error
   */
  trackError(
    moduleName: string,
    errorMessage: string,
    errorDetails?: any
  ): Observable<TrackingResponse> {
    return this.trackAction(
      moduleName,
      'Error',
      {
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      }
    );
  }

  /**
   * Obtiene el historial de tracking
   * @param filters Filtros opcionales
   */
  getHistory(filters?: {
    usuario?: string;
    modulo?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
    top?: number;
  }): Observable<TrackingResponse> {
    let params: any = {};

    if (filters) {
      if (filters.usuario) params.usuario = filters.usuario;
      if (filters.modulo) params.modulo = filters.modulo;
      if (filters.fechaDesde) params.fechaDesde = filters.fechaDesde.toISOString();
      if (filters.fechaHasta) params.fechaHasta = filters.fechaHasta.toISOString();
      if (filters.top) params.top = filters.top.toString();
    }

    return this.http.get<TrackingResponse>(`${this.apiUrl}/history`, { params });
  }

  /**
   * Obtiene estadísticas de uso por módulo
   */
  getModuleStats(fechaDesde?: Date, fechaHasta?: Date): Observable<TrackingResponse> {
    let params: any = {};
    if (fechaDesde) params.fechaDesde = fechaDesde.toISOString();
    if (fechaHasta) params.fechaHasta = fechaHasta.toISOString();

    return this.http.get<TrackingResponse>(`${this.apiUrl}/stats/modules`, { params });
  }

  /**
   * Obtiene los usuarios más activos
   */
  getActiveUsers(top: number = 10): Observable<TrackingResponse> {
    return this.http.get<TrackingResponse>(`${this.apiUrl}/stats/users`, {
      params: { top: top.toString() }
    });
  }

  /**
   * Verifica el estado del servicio WhatsApp
   */
  checkWhatsAppStatus(): Observable<TrackingResponse> {
    return this.http.get<TrackingResponse>(`${this.apiUrl}/whatsapp/status`);
  }

  /**
   * Habilita o deshabilita el tracking globalmente
   */
  setTrackingEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`Tracking ${enabled ? 'habilitado' : 'deshabilitado'}`);
  }

  /**
   * Envía el log al backend
   */
  private sendLog(log: TrackingLogDto): Observable<TrackingResponse> {
    console.log('📤 Enviando tracking:', log);
    console.log('🌐 URL del API:', `${this.apiUrl}/log`);

    return this.http.post<TrackingResponse>(`${this.apiUrl}/log`, log).pipe(
      tap(response => {
        if (response.success) {
          console.log(`✅ Tracking exitoso: ${log.modulo} - ${log.accion}`, response);
        } else {
          console.warn(`⚠️ Tracking fallido: ${response.message}`);
        }
      }),
      catchError(error => {
        console.error('❌ Error al enviar tracking:', error);
        console.error('📋 Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        // No propagamos el error para no afectar la UX
        return of({ success: false, message: error.message || 'Error desconocido' });
      })
    );
  }

  /**
   * Obtiene el usuario actual del LoginService
   */
  private getCurrentUser(): string {
    try {
      const userName = this.loginService.getUserName();
      return userName || 'Usuario Desconocido';
    } catch (error) {
      console.warn('Error al obtener usuario actual:', error);
      return 'Usuario Desconocido';
    }
  }
}
