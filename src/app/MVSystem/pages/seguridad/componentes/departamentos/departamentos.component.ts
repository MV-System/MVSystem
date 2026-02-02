import { Component, OnInit } from '@angular/core';
import { SeguridadService } from '../../servicios/seguridad.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-departamentos',
  template: `
    <app-main title="Departamentos" breadcrumb="Seguridad" breadcrumbItem="Departamentos">
      <div class="row">
        <div class="col-lg-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Gestión de Departamentos</h5>
              <button class="btn btn-primary btn-sm mb-3" (click)="abrirFormulario()">
                <i class="bi bi-plus-circle"></i> Nuevo Departamento
              </button>

              <div *ngIf="loading" class="text-center">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
              </div>

              <div class="table-responsive" *ngIf="!loading && departamentos.length > 0">
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
                    <tr *ngFor="let depto of departamentos">
                      <td>{{depto.codigo}}</td>
                      <td>{{depto.nombre}}</td>
                      <td>{{depto.descripcion}}</td>
                      <td>
                        <span *ngIf="depto.estado === 1" class="badge bg-success">Activo</span>
                        <span *ngIf="depto.estado === 0" class="badge bg-danger">Inactivo</span>
                      </td>
                      <td>{{depto.fechaRegistro | date:'short'}}</td>
                      <td>
                        <button class="btn btn-sm btn-info me-2" (click)="editar(depto)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" (click)="eliminar(depto.codigo)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div *ngIf="!loading && departamentos.length === 0" class="alert alert-info">
                No hay departamentos registrados
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-main>
  `,
  styles: []
})
export class DepartamentosComponent implements OnInit {
  departamentos: any[] = [];
  loading = true;

  constructor(
    private seguridadService: SeguridadService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.cargarDepartamentos();
  }

  cargarDepartamentos(): void {
    this.loading = true;
    this.seguridadService.getDepartamentos().subscribe({
      next: (data) => {
        this.departamentos = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando departamentos:', error);
        this.toastr.error('Error al cargar los departamentos', 'Error');
        this.loading = false;
      }
    });
  }

  abrirFormulario(): void {
    this.toastr.info('Formulario de nuevo departamento (por implementar)', 'Info');
  }

  editar(depto: any): void {
    this.toastr.info(`Editando departamento: ${depto.nombre}`, 'Info');
  }

  eliminar(codigo: number): void {
    if (confirm('¿Deseas eliminar este departamento?')) {
      this.seguridadService.eliminarDepartamento(codigo).subscribe({
        next: () => {
          this.toastr.success('Departamento eliminado correctamente', 'Éxito');
          this.cargarDepartamentos();
        },
        error: (error) => {
          console.error('Error eliminando departamento:', error);
          this.toastr.error('Error al eliminar el departamento', 'Error');
        }
      });
    }
  }
}
