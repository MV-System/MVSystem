import { Component, OnInit } from '@angular/core';
import { SeguridadService } from '../../servicios/seguridad.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sistemas',
  template: `
    <app-main title="Sistemas" breadcrumb="Seguridad" breadcrumbItem="Sistemas">
      <div class="row">
        <div class="col-lg-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Gestión de Sistemas</h5>
              <button class="btn btn-primary btn-sm mb-3" (click)="abrirFormulario()">
                <i class="bi bi-plus-circle"></i> Nuevo Sistema
              </button>

              <div *ngIf="loading" class="text-center">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
              </div>

              <div class="table-responsive" *ngIf="!loading && sistemas.length > 0">
                <table class="table table-striped table-hover">
                  <thead class="table-dark">
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Fecha Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let sistema of sistemas">
                      <td>{{sistema.codigo}}</td>
                      <td>{{sistema.nombre}}</td>
                      <td>{{sistema.descripcion}}</td>
                      <td>
                        <span *ngIf="sistema.estado === 1" class="badge bg-success">Activo</span>
                        <span *ngIf="sistema.estado === 0" class="badge bg-danger">Inactivo</span>
                      </td>
                      <td>{{sistema.fechaRegistro | date:'short'}}</td>
                      <td>
                        <button class="btn btn-sm btn-info me-2" (click)="editar(sistema)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" (click)="eliminar(sistema.codigo)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div *ngIf="!loading && sistemas.length === 0" class="alert alert-info">
                No hay sistemas registrados
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-main>
  `,
  styles: []
})
export class SistemasComponent implements OnInit {
  sistemas: any[] = [];
  loading = true;

  constructor(
    private seguridadService: SeguridadService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.cargarSistemas();
  }

  cargarSistemas(): void {
    this.loading = true;
    this.seguridadService.getSistemas().subscribe({
      next: (data) => {
        this.sistemas = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando sistemas:', error);
        this.toastr.error('Error al cargar los sistemas', 'Error');
        this.loading = false;
      }
    });
  }

  abrirFormulario(): void {
    this.toastr.info('Formulario de nuevo sistema (por implementar)', 'Info');
  }

  editar(sistema: any): void {
    this.toastr.info(`Editando sistema: ${sistema.nombre}`, 'Info');
  }

  eliminar(codigo: number): void {
    if (confirm('¿Deseas eliminar este sistema?')) {
      this.seguridadService.eliminarSistema(codigo).subscribe({
        next: () => {
          this.toastr.success('Sistema eliminado correctamente', 'Éxito');
          this.cargarSistemas();
        },
        error: (error) => {
          console.error('Error eliminando sistema:', error);
          this.toastr.error('Error al eliminar el sistema', 'Error');
        }
      });
    }
  }
}
