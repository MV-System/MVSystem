import { Component, OnInit } from '@angular/core';
import { SeguridadService } from '../../servicios/seguridad.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modulos',
  template: `
    <app-main title="Módulos" breadcrumb="Seguridad" breadcrumbItem="Módulos">
      <div class="row">
        <div class="col-lg-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Gestión de Módulos</h5>
              <button class="btn btn-primary btn-sm mb-3" (click)="abrirFormulario()">
                <i class="bi bi-plus-circle"></i> Nuevo Módulo
              </button>

              <div *ngIf="loading" class="text-center">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
              </div>

              <div class="table-responsive" *ngIf="!loading && modulos.length > 0">
                <table class="table table-striped table-hover">
                  <thead class="table-dark">
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Sistema</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let modulo of modulos">
                      <td>{{modulo.codigo}}</td>
                      <td>{{modulo.nombre}}</td>
                      <td>{{modulo.descripcion}}</td>
                      <td>{{modulo.nombreSistema}}</td>
                      <td>
                        <span *ngIf="modulo.estado === 1" class="badge bg-success">Activo</span>
                        <span *ngIf="modulo.estado === 0" class="badge bg-danger">Inactivo</span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-info me-2" (click)="editar(modulo)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" (click)="eliminar(modulo.codigo)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div *ngIf="!loading && modulos.length === 0" class="alert alert-info">
                No hay módulos registrados
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-main>
  `,
  styles: []
})
export class ModulosComponent implements OnInit {
  modulos: any[] = [];
  loading = true;

  constructor(
    private seguridadService: SeguridadService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.cargarModulos();
  }

  cargarModulos(): void {
    this.loading = true;
    this.seguridadService.getModulos().subscribe({
      next: (data) => {
        this.modulos = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando módulos:', error);
        this.toastr.error('Error al cargar los módulos', 'Error');
        this.loading = false;
      }
    });
  }

  abrirFormulario(): void {
    this.toastr.info('Formulario de nuevo módulo (por implementar)', 'Info');
  }

  editar(modulo: any): void {
    this.toastr.info(`Editando módulo: ${modulo.nombre}`, 'Info');
  }

  eliminar(codigo: number): void {
    if (confirm('¿Deseas eliminar este módulo?')) {
      this.seguridadService.eliminarModulo(codigo).subscribe({
        next: () => {
          this.toastr.success('Módulo eliminado correctamente', 'Éxito');
          this.cargarModulos();
        },
        error: (error) => {
          console.error('Error eliminando módulo:', error);
          this.toastr.error('Error al eliminar el módulo', 'Error');
        }
      });
    }
  }
}
