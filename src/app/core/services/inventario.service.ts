import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APIURL } from 'src/app/config/url';
import {
    InventarioSesion,
    InventarioEquipo,
    IniciarInventarioDTO,
    RegistrarEscaneoDTO,
    FinalizarInventarioDTO,
    GestionarInventarioDTO,
    EscaneoResponse,
    IniciarInventarioResponse,
    FinalizarInventarioResponse
} from '../interfaces/inventario.interface';

@Injectable({
    providedIn: 'root'
})
export class InventarioService {

    constructor(private http: HttpClient) { }

    /**
     * Inicia una nueva sesión de inventario
     */
    iniciarSesion(dto: IniciarInventarioDTO): Observable<IniciarInventarioResponse> {
        console.log('🌐 INVENTARIO-SERVICE - URL Iniciar:', `${APIURL.Inventario.IniciarSesion}`);
        console.log('🌐 INVENTARIO-SERVICE - DTO Iniciar:', dto);

        return this.http.post<IniciarInventarioResponse>(
            `${APIURL.Inventario.IniciarSesion}`,
            dto
        );
    }

    /**
     * Registra el escaneo de un equipo
     */
    registrarEscaneo(dto: RegistrarEscaneoDTO): Observable<EscaneoResponse> {
        return this.http.post<EscaneoResponse>(
            `${APIURL.Inventario.RegistrarEscaneo}`,
            dto
        );
    }

    /**
     * Obtiene equipos pendientes por escanear
     */
    obtenerPendientes(idSesion: number): Observable<InventarioEquipo[]> {
        return this.http.get<InventarioEquipo[]>(
            `${APIURL.Inventario.Pendientes}/${idSesion}`
        );
    }

    /**
     * Obtiene equipos ya escaneados
     */
    obtenerEscaneados(idSesion: number): Observable<InventarioEquipo[]> {
        return this.http.get<InventarioEquipo[]>(
            `${APIURL.Inventario.Escaneados}/${idSesion}`
        );
    }

    /**
     * Finaliza el inventario
     */
    finalizarInventario(dto: FinalizarInventarioDTO): Observable<FinalizarInventarioResponse> {
        return this.http.post<FinalizarInventarioResponse>(
            `${APIURL.Inventario.Finalizar}`,
            dto
        );
    }

    /**
     * Obtiene información de una sesión
     */
    obtenerSesion(idSesion: number): Observable<InventarioSesion> {
        return this.http.get<InventarioSesion>(
            `${APIURL.Inventario.Sesion}/${idSesion}`
        );
    }

    /**
     * Pausa un inventario en proceso
     */
    pausarInventario(dto: GestionarInventarioDTO): Observable<any> {
        return this.http.post(
            `${APIURL.Inventario.Pausar}`,
            dto
        );
    }

    /**
     * Reanuda un inventario pausado
     */
    reanudarInventario(dto: GestionarInventarioDTO): Observable<any> {
        const url = `${APIURL.Inventario.Reanudar}`;
        console.log('🌐 INVENTARIO-SERVICE - URL:', url);
        console.log('🌐 INVENTARIO-SERVICE - DTO:', dto);

        return this.http.post(url, dto);
    }

    /**
     * Obtiene inventarios activos (en proceso o pausados)
     */
    obtenerInventariosActivos(idAlmacen?: number): Observable<InventarioSesion[]> {
        const url = idAlmacen
            ? `${APIURL.Inventario.Activos}?idAlmacen=${idAlmacen}`
            : `${APIURL.Inventario.Activos}`;

        console.log('🌐 INVENTARIO-SERVICE - URL Activos:', url);
        return this.http.get<InventarioSesion[]>(url);
    }

    /**
     * Cancela un inventario (marca como cancelado)
     */
    cancelarInventario(idSesion: number): Observable<any> {
        const url = `${APIURL.Inventario.Cancelar}/${idSesion}`;
        console.log('🌐 INVENTARIO-SERVICE - URL Cancelar:', url);
        console.log('🌐 INVENTARIO-SERVICE - ID Sesion:', idSesion);

        return this.http.delete(url);
    }

    /**
     * Obtiene equipos faltantes de un inventario
     */
    obtenerEquiposFaltantes(idSesion: number): Observable<InventarioEquipo[]> {
        const url = `${APIURL.Inventario.Faltantes}/${idSesion}`;
        return this.http.get<InventarioEquipo[]>(url);
    }

    /**
     * Obtiene equipos sobrantes de un inventario
     */
    obtenerEquiposSobrantes(idSesion: number): Observable<InventarioEquipo[]> {
        const url = `${APIURL.Inventario.Sobrantes}/${idSesion}`;
        return this.http.get<InventarioEquipo[]>(url);
    }
}
