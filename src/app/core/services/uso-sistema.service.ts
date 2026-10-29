import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UsoEvento {
  tipo: 'P' | 'B';
  ruta: string;
  detalle?: string;
}

export interface UsoConectado {
  usuario: string;
  nombreUsuario: string;
  empresa: string;
  ruta: string;
  inicio: string;
  ultimaActividad: string;
  direccionIP: string;
}

export interface UsoDetalleUsuario {
  usuario: string;
  nombreUsuario: string;
  empresa: string;
  veces: number;
  ultima: string;
}

export interface UsoResumen {
  tipo: 'P' | 'B';
  ruta: string;
  detalle: string;
  visitas: number;
  usuarios: number;
  ultima: string;
}

/**
 * Registra el uso del sistema (pantallas abiertas, botones pulsados y latido de la sesion) para la
 * pantalla de Seguridad > Uso del sistema. Nunca debe molestar al usuario: los errores se ignoran.
 */
@Injectable({
  providedIn: 'root'
})
export class UsoSistemaService {

  private readonly url = `${environment.api}api/UsoSistema`;
  // Las llamadas de registro son silenciosas: el interceptor de errores no muestra avisos por ellas
  private readonly silencioso = new HttpHeaders({ 'X-Uso-Silencioso': '1' });
  private readonly claveSesion = 'usoSesionId';
  private readonly latidoMs = 2 * 60 * 1000;
  private readonly envioMs = 5 * 1000;
  private readonly textosIgnorados = ['cerrar', 'close', 'x', 'anterior', 'siguiente', 'previous', 'next'];

  private iniciado = false;
  private pendientes: UsoEvento[] = [];
  private rutaActual = '';
  private temporizadorLatido: any;
  private temporizadorEnvio: any;
  private escuchaClics = (e: Event) => this.alPulsar(e);

  constructor(
    private http: HttpClient,
    private router: Router,
    private zone: NgZone
  ) { }

  /** Empieza a registrar. Es seguro llamarlo varias veces. */
  iniciar(): void {
    if (this.iniciado) return;
    this.iniciado = true;

    this.registrarRuta(this.router.url);
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => this.registrarRuta((e as NavigationEnd).urlAfterRedirects));

    this.zone.runOutsideAngular(() => {
      document.addEventListener('click', this.escuchaClics, true);
      this.temporizadorLatido = setInterval(() => this.enviar(), this.latidoMs);
    });
  }

  /** Marca la sesion como terminada y deja de registrar. Se llama al cerrar sesion. */
  salir(): void {
    const sesionId = this.leerSesionId();
    if (this.iniciado && sesionId && localStorage.getItem('token')) {
      this.http.post(`${this.url}/Salir`, { sesionId }, { headers: this.silencioso }).subscribe({ error: () => { } });
    }
    this.detener();
    try { sessionStorage.removeItem(this.claveSesion); } catch { }
  }

  conectados(minutos = 5): Observable<UsoConectado[]> {
    return this.http.get<UsoConectado[]>(`${this.url}/Conectados`, { params: { minutos: String(minutos) } });
  }

  resumen(desde: string, hasta: string, empresa: string): Observable<UsoResumen[]> {
    const params: any = { desde, hasta };
    if (empresa) params.empresa = empresa;
    return this.http.get<UsoResumen[]>(`${this.url}/Resumen`, { params });
  }

  detalle(tipo: 'P' | 'B', ruta: string, detalle: string, desde: string, hasta: string, empresa: string): Observable<UsoDetalleUsuario[]> {
    const params: any = { tipo, ruta, detalle: detalle || '', desde, hasta };
    if (empresa) params.empresa = empresa;
    return this.http.get<UsoDetalleUsuario[]>(`${this.url}/Detalle`, { params });
  }

  empresas(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/Empresas`);
  }

  primerRegistro(): Observable<{ fecha: string | null }> {
    return this.http.get<{ fecha: string | null }>(`${this.url}/PrimerRegistro`);
  }

  private detener(): void {
    this.iniciado = false;
    this.pendientes = [];
    document.removeEventListener('click', this.escuchaClics, true);
    clearInterval(this.temporizadorLatido);
    clearTimeout(this.temporizadorEnvio);
    this.temporizadorEnvio = null;
  }

  private registrarRuta(url: string): void {
    const ruta = this.normalizarRuta(url);
    if (!ruta.startsWith('/home')) return;
    this.rutaActual = ruta;
    this.pendientes.push({ tipo: 'P', ruta });
    this.enviar();
  }

  /** Quita parametros y agrupa las rutas con identificadores (/editar/123 -> /editar/:id). */
  private normalizarRuta(url: string): string {
    const limpia = (url || '').split('?')[0].split('#')[0];
    return limpia
      .split('/')
      .map(s => (/^\d+$/.test(s) || /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(s)) ? ':id' : s)
      .join('/')
      .replace(/\/+$/, '') || '/';
  }

  private alPulsar(evento: Event): void {
    if (!this.rutaActual) return;
    const destino = evento.target as HTMLElement;
    if (!destino || !destino.closest) return;

    const boton = destino.closest('button, a.btn, [role="button"], input[type="button"], input[type="submit"]') as HTMLElement;
    if (!boton) return;
    // El menu lateral y el encabezado ya se cuentan como pantallas; el paginador es ruido
    if (boton.closest('app-sidebar, app-header, .pagination, pagination-template, .ngx-pagination')) return;

    const detalle = this.textoDelBoton(boton);
    if (!detalle) return;

    this.pendientes.push({ tipo: 'B', ruta: this.rutaActual, detalle });
    // Los clics se agrupan: se envian juntos unos segundos despues
    if (!this.temporizadorEnvio) {
      this.temporizadorEnvio = setTimeout(() => this.enviar(), this.envioMs);
    }
  }

  private textoDelBoton(boton: HTMLElement): string {
    const esEntrada = boton.tagName === 'INPUT';
    let texto = (esEntrada ? (boton as HTMLInputElement).value : boton.innerText) || '';
    texto = texto.split('\n')[0].replace(/\s+/g, ' ').trim();

    if (!texto) {
      texto = boton.getAttribute('title') || boton.getAttribute('aria-label') || boton.getAttribute('data-bs-original-title') || '';
    }
    if (!texto) {
      const icono = boton.querySelector('i[class*="bi-"]');
      const clase = icono ? Array.from(icono.classList).find(c => c.startsWith('bi-')) : '';
      texto = clase ? `[${clase}]` : '';
    }

    texto = texto.trim().substring(0, 80);
    if (!texto || /^\d+$/.test(texto) || this.textosIgnorados.includes(texto.toLowerCase())) return '';
    return texto;
  }

  private enviar(): void {
    clearTimeout(this.temporizadorEnvio);
    this.temporizadorEnvio = null;
    if (!localStorage.getItem('token')) return;

    const eventos = this.pendientes;
    this.pendientes = [];

    this.http.post(`${this.url}/Registrar`,
      { sesionId: this.obtenerSesionId(), ruta: this.rutaActual, eventos },
      { headers: this.silencioso }
    ).subscribe({
      // Si falla, los eventos se descartan: perder algunos no importa
      error: () => { }
    });
  }

  private leerSesionId(): string {
    try { return sessionStorage.getItem(this.claveSesion) || ''; } catch { return ''; }
  }

  private obtenerSesionId(): string {
    let id = this.leerSesionId();
    if (!id) {
      id = this.nuevoGuid();
      try { sessionStorage.setItem(this.claveSesion, id); } catch { }
    }
    return id;
  }

  private nuevoGuid(): string {
    const c: any = (window as any).crypto;
    if (c && c.randomUUID) return c.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ch => {
      const r = Math.random() * 16 | 0;
      return (ch === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
}
