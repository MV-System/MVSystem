import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { ConsultaSqlResultado } from 'src/app/core/interfaces/equipo.interface';

@Component({
  selector: 'app-modo-desarrollador',
  template: `
    <app-main title="Modo Desarrollador" breadcrumb="Seguridad" breadcrumbItem="Modo Desarrollador">
      <div class="row">
        <div class="col-lg-10 mx-auto">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-dark text-white">
              <i class="bi bi-terminal me-2"></i>Terminal SQL
            </div>
            <div class="card-body p-0">
              <div class="terminal-screen">
                <div class="terminal-system-line">MVSystem SQL Console</div>
                <div class="terminal-system-line">Servidor: {{ servidorActual || (cargandoConexion ? 'Consultando...' : 'No disponible') }}</div>
                <div class="terminal-system-line">Base de datos: {{ baseDatosActual || (cargandoConexion ? 'Consultando...' : 'No disponible') }}</div>
                <div class="terminal-security-line">SELECT: máximo 200 filas · UPDATE/DELETE: máximo 10 filas por ejecución · sin límite de tiempo SQL</div>

                <div *ngIf="mensajeConsultaSql" class="terminal-message" [class.terminal-error]="consultaSqlError" role="status">{{ mensajeConsultaSql }}</div>

                <div class="terminal-prompt"><span>admin@mvsystem</span>:<span>~</span>$</div>
                <textarea
                  #terminalSqlInput
                  class="terminal-input"
                  [(ngModel)]="consultaSql"
                  name="consultaSql"
                  rows="5"
                  [disabled]="ejecutandoConsultaSql"
                  placeholder="SELECT TOP (20) * FROM dbo.Equipos"
                  aria-label="Consulta SQL"
                  (keydown)="manejarTeclaTerminal($event)"
                ></textarea>
                <div class="terminal-notice">Enter ejecuta la consulta · Shift+Enter inserta una nueva línea</div>

                <div *ngIf="consultaSqlResultado" class="terminal-results">
                  <div class="terminal-result-summary">
                    {{ consultaSqlResultado.mensaje }}
                    <span *ngIf="consultaSqlResultado.tipoOperacion === 'SELECT'"> · {{ consultaSqlResultado.filas.length }} fila(s) devuelta(s)</span>
                    <span *ngIf="consultaSqlResultado.resultadosLimitados"> · resultados limitados a 200</span>
                  </div>
                  <article *ngFor="let fila of consultaSqlResultado.filas; let filaIndex = index" class="terminal-result-row">
                    <div class="terminal-row-title">Registro {{ filaIndex + 1 }}</div>
                    <div *ngFor="let valor of fila; let columnaIndex = index" class="terminal-result-field">
                      <span class="terminal-column-name">{{ consultaSqlResultado.columnas[columnaIndex] }}:</span>
                      <span>{{ formatearValor(valor) }}</span>
                    </div>
                  </article>
                </div>
              </div>
            </div>
            <div class="card-footer d-flex justify-content-between align-items-center">
              <span class="small text-muted"><i class="bi bi-circle-fill text-success me-2"></i>{{ ejecutandoConsultaSql ? 'Ejecutando consulta...' : 'Conectado' }}</span>
              <button type="button" class="btn btn-success" [disabled]="ejecutandoConsultaSql || !consultaSql.trim()" (click)="ejecutarConsultaSql($event)">
                <span *ngIf="ejecutandoConsultaSql" class="spinner-border spinner-border-sm me-2"></span>
                {{ ejecutandoConsultaSql ? 'Ejecutando...' : 'Ejecutar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </app-main>
  `,
  styles: [`
    .terminal-screen {
      max-height: calc(100vh - 250px);
      min-height: 320px;
      overflow: auto;
      padding: 22px 24px;
      background: #111318;
      color: #e5e7eb;
      font: 14px/1.8 Consolas, "Liberation Mono", monospace;
    }
    .terminal-system-line { color: #9ca3af; }
    .terminal-security-line { margin-top: 4px; color: #e4b95f; font-size: 12px; }
    .terminal-prompt { margin-top: 18px; color: #f3f4f6; }
    .terminal-prompt span:first-child { color: #70d28b; }
    .terminal-prompt span:nth-child(2) { color: #77b7ff; }
    .terminal-notice, .terminal-result-summary { margin-top: 12px; color: #9ca3af; font-size: 12px; }
    .terminal-input {
      display: block;
      width: 100%;
      resize: vertical;
      border: 0;
      outline: 0;
      padding: 2px 0;
      background: transparent;
      color: #f3f4f6;
      caret-color: #70d28b;
      font: inherit;
      line-height: 1.6;
    }
    .terminal-input::placeholder { color: #626975; }
    .terminal-message { margin-top: 16px; color: #70d28b; white-space: pre-wrap; }
    .terminal-error { color: #ff7777; }
    .terminal-results { margin-top: 18px; }
    .terminal-result-row { margin-top: 10px; padding: 10px 12px; border: 1px solid #30343b; border-radius: 5px; background: #171a20; }
    .terminal-row-title { margin-bottom: 6px; color: #70d28b; font-size: 12px; }
    .terminal-result-field { display: grid; grid-template-columns: minmax(130px, 30%) 1fr; gap: 12px; overflow-wrap: anywhere; }
    .terminal-column-name { color: #77b7ff; }
  `]
})
export class ModoDesarrolladorComponent implements OnInit {
  @ViewChild('terminalSqlInput') terminalSqlInput?: ElementRef<HTMLTextAreaElement>;

  consultaSql = '';
  ejecutandoConsultaSql = false;
  consultaSqlError = false;
  mensajeConsultaSql: string | null = null;
  consultaSqlResultado: ConsultaSqlResultado | null = null;
  servidorActual: string | null = null;
  baseDatosActual: string | null = null;
  cargandoConexion = true;

  constructor(
    private toastr: ToastrService,
    private mantenimientoService: MantenimientoService
  ) {}

  ngOnInit(): void {
    this.mantenimientoService.obtenerConexionActualGestionarEquipo().pipe(
      finalize(() => this.cargandoConexion = false)
    ).subscribe({
      next: conexion => {
        this.servidorActual = conexion.servidorConsultado;
        this.baseDatosActual = conexion.baseDatosConsultada;
      },
      error: error => {
        this.consultaSqlError = true;
        this.mensajeConsultaSql = this.obtenerMensajeError(error);
      }
    });
  }

  manejarTeclaTerminal(event: KeyboardEvent): void {
    event.stopPropagation();
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.ejecutarConsultaSql();
    }
  }

  ejecutarConsultaSql(event?: MouseEvent): void {
    event?.preventDefault();
    event?.stopPropagation();

    const consulta = this.consultaSql.trim();
    if (!consulta || this.ejecutandoConsultaSql) return;

    if (this.requiereConfirmacionModificacion(consulta) && !window.confirm(
      'Vas a ejecutar un UPDATE o DELETE. Se confirmarán como máximo 10 filas; si la consulta afecta más de 10, SQL revertirá todos los cambios. ¿Deseas continuar?'
    )) return;

    this.ejecutandoConsultaSql = true;
    this.consultaSqlError = false;
    this.mensajeConsultaSql = null;
    this.consultaSqlResultado = null;

    this.mantenimientoService.ejecutarConsultaSqlGestionarEquipo(consulta).pipe(
      finalize(() => this.ejecutandoConsultaSql = false)
    ).subscribe({
      next: resultado => {
        this.consultaSqlResultado = resultado;
        this.servidorActual = resultado.servidorConsultado || this.servidorActual;
        this.baseDatosActual = resultado.baseDatosConsultada || this.baseDatosActual;
        this.consultaSqlError = resultado.mensaje?.toLowerCase().indexOf('cancelada') >= 0;
        this.mensajeConsultaSql = resultado.mensaje;
      },
      error: error => {
        this.consultaSqlError = true;
        this.mensajeConsultaSql = this.obtenerMensajeError(error);
        this.toastr.error('No se pudo ejecutar la consulta SQL.', 'Error');
      }
    });
  }

  private requiereConfirmacionModificacion(consulta: string): boolean {
    const sinComentarios = consulta
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/--[^\r\n]*/g, ' ')
      .replace(/^\s+/, '');

    return !/^SELECT\b/i.test(sinComentarios);
  }

  private obtenerMensajeError(error: any): string {
    if (typeof error === 'string' && error.trim()) return error;

    const respuesta = error?.error;
    if (typeof respuesta === 'string' && respuesta.trim()) return respuesta;
    if (respuesta && typeof respuesta === 'object') {
      if (typeof respuesta.message === 'string') return respuesta.message;
      if (typeof respuesta.detail === 'string') return respuesta.detail;
      if (typeof respuesta.title === 'string') return respuesta.title;
      if (respuesta.errors && typeof respuesta.errors === 'object') {
        return Object.keys(respuesta.errors)
          .map(clave => {
            const valor = respuesta.errors[clave];
            return Array.isArray(valor) ? valor.join(' ') : String(valor);
          })
          .join(' ');
      }
    }

    if (error?.status === 401) return 'HTTP 401: inicia sesión nuevamente.';
    if (error?.status === 403) return 'HTTP 403: se requiere el permiso ModoDesarrollador.';
    return error?.message || `No se pudo ejecutar la consulta (HTTP ${error?.status || 'desconocido'}).`;
  }

  formatearValor(valor: unknown): string {
    if (valor === null || valor === undefined) return '—';
    return typeof valor === 'object' ? JSON.stringify(valor) : String(valor);
  }
}
