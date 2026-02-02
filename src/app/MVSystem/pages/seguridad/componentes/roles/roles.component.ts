import { Component, OnInit } from '@angular/core';
import { SeguridadService } from '../../servicios/seguridad.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-roles',
  template: `
    <app-main title="Roles" breadcrumb="Seguridad" breadcrumbItem="Roles">
      <div class="row">
        <div class="col-lg-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Gestión de Roles</h5>
              <button class="btn btn-primary btn-sm mb-3" (click)="abrirFormulario()">
                <i class="bi bi-plus-circle"></i> Nuevo Rol
              </button>

              <div *ngIf="loading" class="text-center">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
              </div>

              <div class="table-responsive" *ngIf="!loading && roles.length > 0">
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
                    <tr *ngFor="let rol of roles">
                      <td>{{rol.codigo}}</td>
                      <td>{{rol.nombre}}</td>
                      <td>{{rol.descripcion}}</td>
                      <td>{{rol.nombreSistema}}</td>
                      <td>
                        <span *ngIf="rol.estado === 1" class="badge bg-success">Activo</span>
                        <span *ngIf="rol.estado === 0" class="badge bg-danger">Inactivo</span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-info me-2" (click)="editar(rol)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" (click)="eliminar(rol.codigo)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div *ngIf="!loading && roles.length === 0" class="alert alert-info">
                No hay roles registrados
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-main>
  `,
  styles: []
})
export class RolesComponent implements OnInit {
  roles: any[] = [];
  loading = true;

  constructor(
    private seguridadService: SeguridadService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.loading = true;
    this.seguridadService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando roles:', error);
        this.toastr.error('Error al cargar los roles', 'Error');
        this.loading = false;
      }
    });
  }

  abrirFormulario(): void {
    this.toastr.info('Formulario de nuevo rol (por implementar)', 'Info');
  }

  editar(rol: any): void {
    this.toastr.info(`Editando rol: ${rol.nombre}`, 'Info');
  }

  eliminar(codigo: number): void {
    if (confirm('¿Deseas eliminar este rol?')) {
      this.seguridadService.eliminarRol(codigo).subscribe({
        next: () => {
          this.toastr.success('Rol eliminado correctamente', 'Éxito');
          this.cargarRoles();
        },
        error: (error) => {
          console.error('Error eliminando rol:', error);
          this.toastr.error('Error al eliminar el rol', 'Error');
        }
      });
    }
  }
}
