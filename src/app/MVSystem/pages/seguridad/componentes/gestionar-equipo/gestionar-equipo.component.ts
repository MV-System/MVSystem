import { Component, ElementRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { ConsultaSqlResultado, EquipoValidacionEliminacion } from 'src/app/core/interfaces/equipo.interface';

@Component({
  selector: 'app-gestionar-equipo',
  template: `
    <app-main title="Gestionar Equipo" breadcrumb="Seguridad" breadcrumbItem="Gestionar Equipo">
      <div class="row">
        <div class="col-md-8 mx-auto">
          <div class="card shadow-sm border-0">
            <div class="card-body">
              <h5 class="card-title mb-3">Buscar equipo por IMEI</h5>

              <div class="alert alert-info mb-3">
                Consulta las tablas relacionadas y ejecuta acciones únicamente sobre la tabla seleccionada.
              </div>

              <div class="d-flex justify-content-end mb-3">
                <button type="button" class="btn btn-outline-dark" (click)="abrirTerminal()">
                  <i class="bi bi-terminal me-2"></i>Terminal SQL
                </button>
              </div>

              <div class="mb-3">
                <label for="imei" class="form-label">IMEI</label>
                <input
                  id="imei"
                  type="text"
                  class="form-control"
                  [(ngModel)]="imei"
                  name="imei"
                  placeholder="Ingrese el IMEI"
                  required
                >
              </div>

              <div class="d-grid gap-2 mb-3">
                <button type="button" class="btn btn-primary" [disabled]="!imei || consultando" (click)="consultarEquipo()">
                  <span *ngIf="!consultando">Consultar IMEI</span>
                  <span *ngIf="consultando">
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Validando...
                  </span>
                </button>
              </div>

              <div *ngIf="resultado" class="mt-3">
                <div *ngIf="mensajeAccion" class="alert" [ngClass]="mensajeAccionError ? 'alert-danger' : 'alert-success'" role="status">
                  {{ mensajeAccion }}
                </div>

                <div class="alert alert-light border py-2 mb-3">
                  <div><strong>Servidor:</strong> {{ resultado.servidorConsultado }}</div>
                  <div><strong>Base de datos:</strong> {{ resultado.baseDatosConsultada }}</div>
                </div>

                <div class="alert" [ngClass]="resultado.existe ? 'alert-danger' : 'alert-secondary'">
                  {{ resultado.mensaje }}
                </div>

                <div class="table-responsive">
                  <table class="table table-sm table-bordered mb-0">
                    <thead>
                      <tr>
                        <th>Tabla</th>
                        <th>Existe</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Equipos</td>
                        <td>{{ existeEnTabla('Equipos') ? 'Sí' : 'No' }}</td>
                        <td class="d-flex gap-2">
                          <button *ngIf="existeEnTabla('Equipos')" type="button" class="btn btn-sm btn-outline-primary" (click)="verTabla('Equipos')">Ver</button>
                          <button *ngIf="existeEnTabla('Equipos')" type="button" class="btn btn-sm btn-outline-danger" [disabled]="eliminandoTabla !== null" (click)="eliminarDeTabla('Equipos')">{{ eliminandoTabla === 'Equipos' ? 'Eliminando...' : 'Eliminar' }}</button>
                        </td>
                      </tr>
                      <tr>
                        <td>InventarioEquipo</td>
                        <td>{{ existeEnTabla('InventarioEquipo') ? 'Sí' : 'No' }}</td>
                        <td class="d-flex gap-2">
                          <button *ngIf="existeEnTabla('InventarioEquipo')" type="button" class="btn btn-sm btn-outline-primary" (click)="verTabla('InventarioEquipo')">Ver</button>
                          <button *ngIf="existeEnTabla('InventarioEquipo')" type="button" class="btn btn-sm btn-outline-danger" [disabled]="eliminandoTabla !== null" (click)="eliminarDeTabla('InventarioEquipo')">{{ eliminandoTabla === 'InventarioEquipo' ? 'Eliminando...' : 'Eliminar' }}</button>
                        </td>
                      </tr>
                      <tr>
                        <td>Detalle_Facturas</td>
                        <td>{{ existeEnTabla('Detalle_Facturas') ? 'Sí' : 'No' }}</td>
                        <td class="d-flex gap-2">
                          <button *ngIf="existeEnTabla('Detalle_Facturas')" type="button" class="btn btn-sm btn-outline-primary" (click)="verTabla('Detalle_Facturas')">Ver</button>
                          <button *ngIf="existeEnTabla('Detalle_Facturas')" type="button" class="btn btn-sm btn-outline-danger" [disabled]="eliminandoTabla !== null" (click)="eliminarDeTabla('Detalle_Facturas')">{{ eliminandoTabla === 'Detalle_Facturas' ? 'Eliminando...' : 'Eliminar' }}</button>
                        </td>
                      </tr>
                      <tr>
                        <td>Equipos_Historico</td>
                        <td>{{ existeEnTabla('Equipos_Historico') ? 'Sí' : 'No' }}</td>
                        <td class="d-flex gap-2">
                          <button *ngIf="existeEnTabla('Equipos_Historico')" type="button" class="btn btn-sm btn-outline-primary" (click)="verTabla('Equipos_Historico')">Ver</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div *ngIf="tablaSeleccionada" class="card mt-3 border-primary">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <strong>{{ tablaSeleccionada }} — {{ registrosSeleccionados.length }} registro(s)</strong>
                    <button type="button" class="btn-close" aria-label="Cerrar" (click)="cerrarTabla()"></button>
                  </div>
                  <div class="card-body">
                    <div *ngFor="let registro of registrosSeleccionados; let i = index" class="border rounded p-3 mb-3">
                      <h6 class="mb-3">Registro {{ i + 1 }}</h6>
                      <div class="row">
                        <div *ngFor="let campo of registro | keyvalue" class="col-md-6 mb-2">
                          <strong>{{ campo.key }}:</strong> {{ formatearValor(campo.value) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-main>

    <div *ngIf="mostrarModalTerminal" class="terminal-backdrop" (click)="cerrarTerminal()">
      <section class="terminal-window" role="dialog" aria-modal="true" aria-labelledby="terminal-title" (click)="$event.stopPropagation()">
        <header class="terminal-titlebar">
          <div class="terminal-window-controls" aria-hidden="true">
            <span class="terminal-control terminal-close"></span>
            <span class="terminal-control terminal-minimize"></span>
            <span class="terminal-control terminal-maximize"></span>
          </div>
          <span id="terminal-title" class="terminal-title">Terminal SQL</span>
          <button type="button" class="terminal-dismiss" aria-label="Cerrar terminal" (click)="cerrarTerminal()">×</button>
        </header>

        <div class="terminal-screen">
          <div class="terminal-system-line">MVSystem SQL Console</div>
          <div class="terminal-system-line">Conexión: {{ consultaSqlResultado?.servidorConsultado || resultado?.servidorConsultado || 'servidor de la empresa' }} / {{ consultaSqlResultado?.baseDatosConsultada || resultado?.baseDatosConsultada || 'base de datos activa' }}</div>
          <div class="terminal-security-line">SELECT: máximo 200 filas · UPDATE/DELETE: máximo 10 filas por ejecución · sin límite de tiempo SQL</div>

          <div *ngIf="mensajeConsultaSql" class="terminal-message" [class.terminal-error]="consultaSqlError">{{ mensajeConsultaSql }}</div>

          <div class="terminal-prompt"><span>admin@mvsystem</span>:<span>~</span>$</div>
          <textarea
            #terminalSqlInput
            class="terminal-input"
            [(ngModel)]="consultaSql"
            name="consultaSql"
            rows="3"
            [disabled]="ejecutandoConsultaSql"
            placeholder="SELECT TOP (20) * FROM dbo.Equipos"
            aria-label="Consulta SQL"
            (keydown)="manejarTeclaTerminal($event)"
          ></textarea>
          <div class="terminal-notice">Enter ejecuta la consulta · usa “Nueva línea” para escribir consultas multilínea desde el celular</div>

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

        <footer class="terminal-footer">
          <span><i class="bi bi-circle-fill me-2"></i>{{ ejecutandoConsultaSql ? 'Ejecutando consulta...' : 'Conectado' }}</span>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-sm btn-outline-light" [disabled]="ejecutandoConsultaSql" (click)="insertarNuevaLinea()">Nueva línea</button>
            <button type="button" class="btn btn-sm btn-success" [disabled]="ejecutandoConsultaSql || !consultaSql.trim()" (click)="ejecutarConsultaSql($event)">
              {{ ejecutandoConsultaSql ? 'Ejecutando...' : 'Ejecutar' }}
            </button>
            <button type="button" class="btn btn-sm btn-outline-light" (click)="cerrarTerminal()">Cerrar</button>
          </div>
        </footer>
      </section>
    </div>
  `,
  styles: [`
    .terminal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1060;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: rgba(9, 12, 18, .68);
    }

    .terminal-window {
      width: min(900px, 100%);
      max-height: calc(100vh - 2rem);
      overflow: hidden;
      border: 1px solid #42464e;
      border-radius: 10px;
      background: #111318;
      box-shadow: 0 24px 80px rgba(0, 0, 0, .48);
      color: #e5e7eb;
      font-family: Consolas, "Liberation Mono", monospace;
    }

    .terminal-titlebar {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      border-bottom: 1px solid #30343b;
      background: #22252c;
    }

    .terminal-window-controls {
      position: absolute;
      left: 14px;
      display: flex;
      gap: 7px;
    }

    .terminal-control {
      width: 11px;
      height: 11px;
      border-radius: 50%;
    }

    .terminal-close { background: #ff5f57; }
    .terminal-minimize { background: #febc2e; }
    .terminal-maximize { background: #28c840; }
    .terminal-title { color: #c8cbd1; font: 12px Arial, sans-serif; }

    .terminal-dismiss {
      position: absolute;
      right: 12px;
      border: 0;
      background: transparent;
      color: #aeb3bc;
      font-size: 24px;
      line-height: 1;
    }

    .terminal-screen {
      max-height: calc(100vh - 150px);
      min-height: 260px;
      overflow: auto;
      padding: 22px 24px;
      background: #111318;
      font-size: 14px;
      line-height: 1.8;
    }

    .terminal-system-line { color: #9ca3af; }
    .terminal-security-line { margin-top: 4px; color: #e4b95f; font-size: 12px; }
    .terminal-prompt { margin-top: 18px; color: #f3f4f6; }
    .terminal-prompt span:first-child { color: #70d28b; }
    .terminal-prompt span:nth-child(2) { color: #77b7ff; }
    .terminal-notice { margin-top: 12px; color: #858b96; font-size: 12px; }
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
    .terminal-result-summary { margin-bottom: 10px; color: #9ca3af; font-size: 12px; }
    .terminal-result-row { margin-bottom: 10px; padding: 10px 12px; border: 1px solid #30343b; border-radius: 5px; background: #171a20; }
    .terminal-row-title { margin-bottom: 6px; color: #70d28b; font-size: 12px; }
    .terminal-result-field { display: grid; grid-template-columns: minmax(130px, 30%) 1fr; gap: 12px; overflow-wrap: anywhere; }
    .terminal-column-name { color: #77b7ff; }

    .terminal-cursor {
      display: inline-block;
      width: 8px;
      height: 16px;
      margin-left: 3px;
      vertical-align: text-bottom;
      background: #c8cbd1;
      animation: terminal-blink 1s steps(2, start) infinite;
    }

    .terminal-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      border-top: 1px solid #30343b;
      background: #1b1e24;
      color: #9ca3af;
      font: 11px Arial, sans-serif;
    }

    .terminal-footer .bi-circle-fill { color: #28c840; font-size: 8px; }

    @keyframes terminal-blink {
      to { visibility: hidden; }
    }
  `]
})
export class GestionarEquipoComponent {
  @ViewChild('terminalSqlInput') terminalSqlInput?: ElementRef<HTMLTextAreaElement>;

  imei = '';
  mostrarModalTerminal = false;
  consultaSql = '';
  ejecutandoConsultaSql = false;
  consultaSqlError = false;
  mensajeConsultaSql: string | null = null;
  consultaSqlResultado: ConsultaSqlResultado | null = null;
  consultando = false;
  eliminandoTabla: keyof EquipoValidacionEliminacion['registros'] | null = null;
  mensajeAccion: string | null = null;
  mensajeAccionError = false;
  resultado: EquipoValidacionEliminacion | null = null;
  tablaSeleccionada: keyof EquipoValidacionEliminacion['registros'] | null = null;

  get registrosSeleccionados(): Array<Record<string, unknown>> {
    if (!this.resultado || !this.tablaSeleccionada) {
      return [];
    }

    const claveTabla = Object.keys(this.resultado.registros || {}).find(
      clave => clave.toLowerCase() === this.tablaSeleccionada?.toLowerCase()
    );
    return claveTabla ? this.resultado.registros[claveTabla as keyof EquipoValidacionEliminacion['registros']] || [] : [];
  }

  constructor(
    private toastr: ToastrService,
    private mantenimientoService: MantenimientoService
  ) {}

  consultarEquipo(): void {
    if (!this.imei || !this.imei.trim()) {
      this.toastr.error('Debe ingresar un IMEI válido.', 'Error');
      return;
    }

    this.consultando = true;
    this.resultado = null;
    this.tablaSeleccionada = null;
    this.mensajeAccion = null;

    this.mantenimientoService.consultarEquipoParaEliminar(this.imei.trim()).subscribe({
      next: (response) => {
        this.resultado = response;
        this.toastr.info(response.mensaje, response.existe ? 'Equipo encontrado' : 'No encontrado');
      },
      error: (error) => {
        console.error('Error validando IMEI:', error);
        this.toastr.error(error?.error?.message || 'No se pudo validar el IMEI.', 'Error');
      },
      complete: () => {
        this.consultando = false;
      }
    });
  }

  verTabla(tabla: keyof EquipoValidacionEliminacion['registros']): void {
    this.tablaSeleccionada = tabla;
  }

  existeEnTabla(tabla: string): boolean {
    return this.resultado?.tablas?.some(
      encontrada => encontrada.toLowerCase() === tabla.toLowerCase()
    ) ?? false;
  }

  cerrarTabla(): void {
    this.tablaSeleccionada = null;
  }

  abrirTerminal(): void {
    this.mostrarModalTerminal = true;
  }

  cerrarTerminal(): void {
    this.mostrarModalTerminal = false;
  }

  manejarTeclaTerminal(event: KeyboardEvent): void {
    event.stopPropagation();
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.ejecutarConsultaSql();
    }
  }

  insertarNuevaLinea(): void {
    const input = this.terminalSqlInput?.nativeElement;
    if (!input) {
      this.consultaSql += '\n';
      return;
    }

    const inicio = input.selectionStart ?? this.consultaSql.length;
    const fin = input.selectionEnd ?? inicio;
    this.consultaSql = `${this.consultaSql.substring(0, inicio)}\n${this.consultaSql.substring(fin)}`;

    setTimeout(() => {
      input.focus();
      input.setSelectionRange(inicio + 1, inicio + 1);
    });
  }

  ejecutarConsultaSql(event?: MouseEvent): void {
    event?.preventDefault();
    event?.stopPropagation();

    const consulta = this.consultaSql.trim();
    if (!consulta || this.ejecutandoConsultaSql) {
      return;
    }

    if (this.requiereConfirmacionModificacion(consulta)) {
      const confirmacion = window.confirm(
        'Vas a ejecutar un UPDATE o DELETE. Se confirmarán como máximo 10 filas; si la consulta afecta más de 10, SQL revertirá todos los cambios. ¿Deseas continuar?'
      );
      if (!confirmacion) {
        return;
      }
    }

    this.ejecutandoConsultaSql = true;
    this.consultaSqlError = false;
    this.mensajeConsultaSql = null;
    this.consultaSqlResultado = null;

    this.mantenimientoService.ejecutarConsultaSqlGestionarEquipo(consulta).pipe(
      finalize(() => this.ejecutandoConsultaSql = false)
    ).subscribe({
      next: (resultado) => {
        this.consultaSqlResultado = resultado;
        this.consultaSqlError = resultado.mensaje?.toLowerCase().indexOf('cancelada') >= 0;
        this.mensajeConsultaSql = resultado.mensaje;
      },
      error: (error) => {
        this.consultaSqlError = true;
        this.mensajeConsultaSql = this.obtenerMensajeError(error);
      }
    });
  }

  private requiereConfirmacionModificacion(consulta: string): boolean {
    const sinComentarios = consulta
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/--[^\r\n]*/g, ' ')
      .replace(/^\s+/, '');

    // Solo SELECT queda exento; CTE u otra forma se confirma por precaución.
    return !/^SELECT\b/i.test(sinComentarios);
  }

  eliminarDeTabla(tabla: keyof EquipoValidacionEliminacion['registros']): void {
    if (this.mostrarModalTerminal) {
      return;
    }

    const confirmacion = window.confirm(`¿Confirma eliminar de ${tabla} todos los registros asociados al IMEI ${this.imei.trim()}?`);
    if (!confirmacion) {
      return;
    }

    this.eliminandoTabla = tabla;
    this.mensajeAccion = null;
    this.mensajeAccionError = false;

    this.mantenimientoService.eliminarRegistroEquipoDeTabla(this.imei.trim(), tabla).pipe(
      finalize(() => this.eliminandoTabla = null)
    ).subscribe({
      next: (response) => {
        this.mensajeAccion = response.mensaje;
        this.mensajeAccionError = /no se elimin|error/i.test(response.mensaje || '');
        this.tablaSeleccionada = null;
        this.mantenimientoService.consultarEquipoParaEliminar(this.imei.trim()).subscribe({
          next: (resultado) => this.resultado = resultado,
          error: () => {
            this.mensajeAccion = `${this.mensajeAccion} No se pudo actualizar la consulta.`;
            this.mensajeAccionError = true;
          }
        });
      },
      error: (error) => {
        this.mensajeAccion = this.obtenerMensajeError(error);
        this.mensajeAccionError = true;
      }
    });
  }

  private obtenerMensajeError(error: any): string {
    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    const respuesta = error?.error;
    if (typeof respuesta === 'string' && respuesta.trim()) {
      return respuesta;
    }

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

    if (error?.status === 401) {
      return 'HTTP 401: la sesión no está autorizada para ejecutar esta acción. Vuelve a iniciar sesión.';
    }
    if (error?.status === 403) {
      return 'HTTP 403: el usuario no tiene permiso para ejecutar esta acción.';
    }

    return error?.message || `No se pudo eliminar el registro (HTTP ${error?.status || 'desconocido'}).`;
  }

  formatearValor(valor: unknown): string {
    if (valor === null || valor === undefined) {
      return '—';
    }

    return typeof valor === 'object' ? JSON.stringify(valor) : String(valor);
  }
}
