import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { EquipoValidacionEliminacion } from 'src/app/core/interfaces/equipo.interface';

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
  `,
  styles: []
})
export class GestionarEquipoComponent {
  imei = '';
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

  eliminarDeTabla(tabla: keyof EquipoValidacionEliminacion['registros']): void {
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
    if (typeof error === 'string' && error.trim()) return error;
    if (typeof error?.error === 'string' && error.error.trim()) return error.error;
    if (typeof error?.error?.message === 'string') return error.error.message;
    return error?.message || `No se pudo eliminar el registro (HTTP ${error?.status || 'desconocido'}).`;
  }

  formatearValor(valor: unknown): string {
    if (valor === null || valor === undefined) {
      return '—';
    }

    return typeof valor === 'object' ? JSON.stringify(valor) : String(valor);
  }
}
