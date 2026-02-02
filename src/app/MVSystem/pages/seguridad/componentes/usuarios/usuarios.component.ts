import { Component, OnInit } from '@angular/core';
import { SeguridadService } from '../../servicios/seguridad.service';
import { ToastrService } from 'ngx-toastr';

interface FormularioUsuario {
  nombre: string;
  login: string;
  password: string;
  descripcion: string;
  perfil: number | null;
  departamento: number | null;
  estado: number;
}

@Component({
  selector: 'app-usuarios',
  template: `
    <app-main title="Usuarios" breadcrumb="Seguridad" breadcrumbItem="Usuarios">
      <div class="row">
        <div class="col-lg-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Gestión de Usuarios</h5>
              <button class="btn btn-primary btn-sm mb-3" (click)="abrirFormulario()">
                <i class="bi bi-plus-circle"></i> Nuevo Usuario
              </button>

              <div *ngIf="loading" class="text-center">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
              </div>

              <div class="table-responsive" *ngIf="!loading && usuarios.length > 0">
                <table class="table table-striped table-hover">
                  <thead class="table-dark">
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Login</th>
                      <th>Perfil</th>
                      <th>Departamento</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let usuario of usuarios">
                      <td>{{usuario.codigo}}</td>
                      <td>{{usuario.nombre}}</td>
                      <td>{{usuario.login}}</td>
                      <td>{{usuario.nombrePerfil}}</td>
                      <td>{{usuario.nombreDepartamento}}</td>
                      <td>
                        <span *ngIf="usuario.estado === 1" class="badge bg-success">Activo</span>
                        <span *ngIf="usuario.estado === 0" class="badge bg-danger">Inactivo</span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-info me-2" (click)="editar(usuario)" title="Editar">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-warning me-2" (click)="abrirCambiarContrasena(usuario)" title="Cambiar contraseña" *ngIf="tienePermisoCambiarClave">
                          <i class="bi bi-key"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" (click)="eliminar(usuario.codigo)" title="Eliminar">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div *ngIf="!loading && usuarios.length === 0" class="alert alert-info">
                No hay usuarios registrados
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Formulario Usuario -->
      <div class="modal" [class.show]="mostrarModal" [style.display]="mostrarModal ? 'block' : 'none'" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ usuarioEnEdicion.codigo ? 'Editar Usuario' : 'Nuevo Usuario' }}</h5>
              <button type="button" class="btn-close" (click)="cerrarModal()"></button>
            </div>
            <div class="modal-body">
              <form (ngSubmit)="guardarUsuario()">
                <div class="mb-3">
                  <label for="nombre" class="form-label">Nombre</label>
                  <input type="text" class="form-control" id="nombre" [(ngModel)]="formularioUsuario.nombre"
                         name="nombre" required>
                </div>

                <div class="mb-3">
                  <label for="login" class="form-label">Login</label>
                  <input type="text" class="form-control" id="login" [(ngModel)]="formularioUsuario.login"
                         name="login" required [disabled]="usuarioEnEdicion.codigo">
                </div>

                <div class="mb-3" *ngIf="!usuarioEnEdicion.codigo">
                  <label for="password" class="form-label">Contraseña</label>
                  <input type="password" class="form-control" id="password" [(ngModel)]="formularioUsuario.password"
                         name="password" required>
                </div>

                <div class="mb-3">
                  <label for="descripcion" class="form-label">Descripción</label>
                  <input type="text" class="form-control" id="descripcion" [(ngModel)]="formularioUsuario.descripcion"
                         name="descripcion">
                </div>

                <div class="mb-3">
                  <label for="perfil" class="form-label">Perfil</label>
                  <select class="form-control" id="perfil" [(ngModel)]="formularioUsuario.perfil" name="perfil">
                    <option [value]="null">Seleccionar...</option>
                    <option *ngFor="let perfil of perfiles" [value]="perfil.codigo">{{ perfil.nombre }}</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label for="departamento" class="form-label">Departamento</label>
                  <select class="form-control" id="departamento" [(ngModel)]="formularioUsuario.departamento"
                          name="departamento">
                    <option [value]="null">Seleccionar...</option>
                    <option *ngFor="let dept of departamentos" [value]="dept.codigo">{{ dept.nombre }}</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label for="estado" class="form-label">Estado</label>
                  <select class="form-control" id="estado" [(ngModel)]="formularioUsuario.estado" name="estado">
                    <option [value]="1">Activo</option>
                    <option [value]="0">Inactivo</option>
                  </select>
                </div>

                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
                  <button type="submit" class="btn btn-primary" [disabled]="!esFormularioValido() || guardando">
                    <span *ngIf="!guardando">Guardar</span>
                    <span *ngIf="guardando">
                      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Guardando...
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" [class.show]="mostrarModal" *ngIf="mostrarModal"></div>

      <!-- Modal Cambiar Contraseña -->
      <div class="modal" [class.show]="mostrarModalContrasena" [style.display]="mostrarModalContrasena ? 'block' : 'none'" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Cambiar Contraseña - {{ usuarioParaCambiarContrasena?.nombre }}</h5>
              <button type="button" class="btn-close" (click)="cerrarModalContrasena()"></button>
            </div>
            <div class="modal-body">
              <form (ngSubmit)="guardarNuevaContrasena()">
                <div class="mb-3">
                  <label for="nuevaContrasena" class="form-label">Nueva Contraseña</label>
                  <input type="password" class="form-control" id="nuevaContrasena"
                         [(ngModel)]="nuevaContrasena" name="nuevaContrasena" required minlength="6">
                  <small class="form-text text-muted">Mínimo 6 caracteres</small>
                </div>

                <div class="mb-3">
                  <label for="confirmarContrasena" class="form-label">Confirmar Contraseña</label>
                  <input type="password" class="form-control" id="confirmarContrasena"
                         [(ngModel)]="confirmarContrasena" name="confirmarContrasena" required minlength="6">
                </div>

                <div *ngIf="nuevaContrasena && confirmarContrasena && nuevaContrasena !== confirmarContrasena" class="alert alert-danger alert-sm">
                  Las contraseñas no coinciden
                </div>

                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" (click)="cerrarModalContrasena()">Cancelar</button>
                  <button type="submit" class="btn btn-primary"
                          [disabled]="!nuevaContrasena || !confirmarContrasena || nuevaContrasena !== confirmarContrasena || nuevaContrasena.length < 6 || guardandoContrasena">
                    <span *ngIf="!guardandoContrasena">Guardar</span>
                    <span *ngIf="guardandoContrasena">
                      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Guardando...
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" [class.show]="mostrarModalContrasena" *ngIf="mostrarModalContrasena"></div>
    </app-main>
  `,
  styles: []
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  perfiles: any[] = [];
  departamentos: any[] = [];
  permisos: any[] = [];
  loading = true;
  mostrarModal = false;
  guardando = false;
  usuarioEnEdicion: any = {};
  formularioUsuario: FormularioUsuario;
  mostrarModalContrasena = false;
  guardandoContrasena = false;
  usuarioParaCambiarContrasena: any = null;
  nuevaContrasena = '';
  confirmarContrasena = '';
  tienePermisoCambiarClave = false;

  constructor(
    private seguridadService: SeguridadService,
    private toastr: ToastrService
  ) {
    this.formularioUsuario = {
      nombre: '',
      login: '',
      password: '',
      descripcion: '',
      perfil: null,
      departamento: null,
      estado: 1
    };
  }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarPerfiles();
    this.cargarDepartamentos();
    this.cargarPermisos();
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.seguridadService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.toastr.error('Error al cargar los usuarios', 'Error');
        this.loading = false;
      }
    });
  }

  cargarPerfiles(): void {
    this.seguridadService.getPerfiles().subscribe({
      next: (data) => {
        this.perfiles = data;
      },
      error: (error) => {
        console.error('Error cargando perfiles:', error);
        this.toastr.error('Error al cargar perfiles', 'Error');
      }
    });
  }

  cargarDepartamentos(): void {
    this.seguridadService.getDepartamentos().subscribe({
      next: (data) => {
        this.departamentos = data;
      },
      error: (error) => {
        console.error('Error cargando departamentos:', error);
        this.toastr.error('Error al cargar departamentos', 'Error');
      }
    });
  }

  cargarPermisos(): void {
    this.seguridadService.getPermisos().subscribe({
      next: (data) => {
        this.permisos = data;
        // Por ahora mostrar el botón si el permiso existe en el sistema
        // TODO: Verificar permisos específicos del usuario logueado
        this.tienePermisoCambiarClave = true;
      },
      error: (error) => {
        console.error('Error cargando permisos:', error);
        // Mostrar el botón por defecto si hay error
        this.tienePermisoCambiarClave = true;
      }
    });
  }

  abrirFormulario(): void {
    this.usuarioEnEdicion = {};
    this.formularioUsuario = {
      nombre: '',
      login: '',
      password: '',
      descripcion: '',
      perfil: null,
      departamento: null,
      estado: 1
    };
    this.mostrarModal = true;
  }

  editar(usuario: any): void {
    this.usuarioEnEdicion = { ...usuario };
    this.formularioUsuario = {
      nombre: usuario.nombre,
      login: usuario.login,
      password: '',
      descripcion: usuario.descripcion || '',
      perfil: usuario.perfil,
      departamento: usuario.departamento,
      estado: usuario.estado || 1
    };
    this.mostrarModal = true;
  }

  esFormularioValido(): boolean {
    return this.formularioUsuario.nombre.trim().length > 0 &&
           this.formularioUsuario.login.trim().length > 0 &&
           (!this.usuarioEnEdicion.codigo || this.formularioUsuario.login.trim().length > 0) &&
           (this.usuarioEnEdicion.codigo || this.formularioUsuario.password.length >= 6);
  }

  guardarUsuario(): void {
    if (!this.esFormularioValido()) {
      this.toastr.error('Por favor complete todos los campos requeridos', 'Error');
      return;
    }

    if (this.usuarioEnEdicion.codigo) {
      this.actualizarUsuario();
    } else {
      this.crearUsuario();
    }
  }

  crearUsuario(): void {
    this.guardando = true;
    const nuevoUsuario = {
      nombre: this.formularioUsuario.nombre.trim(),
      login: this.formularioUsuario.login.trim(),
      password: this.formularioUsuario.password,
      descripcion: this.formularioUsuario.descripcion.trim(),
      perfil: this.formularioUsuario.perfil,
      departamento: this.formularioUsuario.departamento,
      estado: this.formularioUsuario.estado
    };

    this.seguridadService.crearUsuario(nuevoUsuario).subscribe({
      next: () => {
        this.toastr.success('Usuario creado exitosamente', 'Éxito');
        this.cerrarModal();
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error creando usuario:', error);
        this.toastr.error(error.error?.mensaje || 'Error al crear el usuario', 'Error');
      },
      complete: () => {
        this.guardando = false;
      }
    });
  }

  actualizarUsuario(): void {
    this.guardando = true;
    const usuarioActualizado = {
      codigo: this.usuarioEnEdicion.codigo,
      nombre: this.formularioUsuario.nombre.trim(),
      descripcion: this.formularioUsuario.descripcion.trim(),
      perfil: this.formularioUsuario.perfil,
      departamento: this.formularioUsuario.departamento,
      estado: this.formularioUsuario.estado
    };

    this.seguridadService.actualizarUsuario(usuarioActualizado).subscribe({
      next: () => {
        this.toastr.success('Usuario actualizado exitosamente', 'Éxito');
        this.cerrarModal();
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error actualizando usuario:', error);
        this.toastr.error(error.error?.mensaje || 'Error al actualizar el usuario', 'Error');
      },
      complete: () => {
        this.guardando = false;
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.usuarioEnEdicion = {};
    this.formularioUsuario = {
      nombre: '',
      login: '',
      password: '',
      descripcion: '',
      perfil: null,
      departamento: null,
      estado: 1
    };
  }

  eliminar(codigo: number): void {
    if (confirm('¿Deseas eliminar este usuario?')) {
      this.seguridadService.eliminarUsuario(codigo).subscribe({
        next: () => {
          this.toastr.success('Usuario eliminado correctamente', 'Éxito');
          this.cargarUsuarios();
        },
        error: (error) => {
          console.error('Error eliminando usuario:', error);
          this.toastr.error(error.error?.mensaje || 'Error al eliminar el usuario', 'Error');
        }
      });
    }
  }

  abrirCambiarContrasena(usuario: any): void {
    this.usuarioParaCambiarContrasena = { ...usuario };
    this.nuevaContrasena = '';
    this.confirmarContrasena = '';
    this.mostrarModalContrasena = true;
  }

  guardarNuevaContrasena(): void {
    if (!this.nuevaContrasena || !this.confirmarContrasena) {
      this.toastr.error('Por favor complete todos los campos', 'Error');
      return;
    }

    if (this.nuevaContrasena.length < 6) {
      this.toastr.error('La contraseña debe tener mínimo 6 caracteres', 'Error');
      return;
    }

    if (this.nuevaContrasena !== this.confirmarContrasena) {
      this.toastr.error('Las contraseñas no coinciden', 'Error');
      return;
    }

    this.guardandoContrasena = true;
    this.seguridadService.cambiarContrasenaAdmin(this.usuarioParaCambiarContrasena.codigo, this.nuevaContrasena).subscribe({
      next: () => {
        this.toastr.success('Contraseña cambiada exitosamente', 'Éxito');
        this.cerrarModalContrasena();
      },
      error: (error) => {
        console.error('Error cambiando contraseña:', error);
        this.toastr.error(error.error?.mensaje || 'Error al cambiar la contraseña', 'Error');
      },
      complete: () => {
        this.guardandoContrasena = false;
      }
    });
  }

  cerrarModalContrasena(): void {
    this.mostrarModalContrasena = false;
    this.usuarioParaCambiarContrasena = null;
    this.nuevaContrasena = '';
    this.confirmarContrasena = '';
  }
}
