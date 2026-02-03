import { Component, OnInit } from '@angular/core';
import { SeguridadService } from '../../servicios/seguridad.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cambiar-clave',
  template: `
    <app-main title="Cambiar Contraseña" breadcrumb="Seguridad" breadcrumbItem="Cambiar Contraseña">
      <div class="row">
        <div class="col-md-6 mx-auto">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Cambiar Tu Contraseña</h5>
              <form (ngSubmit)="cambiarContrasena()">
                <div class="mb-3">
                  <label for="contrasenaActual" class="form-label">Contraseña Actual</label>
                  <input type="password" class="form-control" id="contrasenaActual"
                         [(ngModel)]="contrasenaActual" name="contrasenaActual" required>
                </div>

                <div class="mb-3">
                  <label for="nuevaContrasena" class="form-label">Nueva Contraseña</label>
                  <input type="password" class="form-control" id="nuevaContrasena"
                         [(ngModel)]="nuevaContrasena" name="nuevaContrasena" required minlength="6">
                  <small class="form-text text-muted">Minimo 6 caracteres</small>
                </div>

                <div class="mb-3">
                  <label for="confirmarContrasena" class="form-label">Confirmar Contraseña</label>
                  <input type="password" class="form-control" id="confirmarContrasena"
                         [(ngModel)]="confirmarContrasena" name="confirmarContrasena" required minlength="6">
                </div>

                <div *ngIf="nuevaContrasena && confirmarContrasena && nuevaContrasena !== confirmarContrasena" class="alert alert-danger alert-sm">
                  Las contrasenas no coinciden
                </div>

                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-primary"
                          [disabled]="!contrasenaActual || !nuevaContrasena || !confirmarContrasena || nuevaContrasena !== confirmarContrasena || nuevaContrasena.length < 6 || guardando">
                    <span *ngIf="!guardando">Cambiar Contraseña</span>
                    <span *ngIf="guardando">
                      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Cambiando...
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </app-main>
  `,
  styles: []
})
export class CambiarClaveComponent implements OnInit {
  contrasenaActual = '';
  nuevaContrasena = '';
  confirmarContrasena = '';
  guardando = false;

  constructor(
    private seguridadService: SeguridadService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
  }

  cambiarContrasena(): void {
    if (!this.contrasenaActual || !this.nuevaContrasena || !this.confirmarContrasena) {
      this.toastr.error('Por favor complete todos los campos', 'Error');
      return;
    }

    if (this.nuevaContrasena.length < 6) {
      this.toastr.error('La contraseña debe tener minimo 6 caracteres', 'Error');
      return;
    }

    if (this.nuevaContrasena !== this.confirmarContrasena) {
      this.toastr.error('Las contrasenas no coinciden', 'Error');
      return;
    }

    this.guardando = true;
    const payload = {
      contrasenaActual: this.contrasenaActual,
      contrasenaNueva: this.nuevaContrasena,
      confirmarContrasena: this.confirmarContrasena
    };

    this.seguridadService.cambiarContraseñaUsuario(payload).subscribe({
      next: () => {
        this.toastr.success('Contraseña cambiada exitosamente', 'Exito');
        this.contrasenaActual = '';
        this.nuevaContrasena = '';
        this.confirmarContrasena = '';
      },
      error: (error) => {
        console.error('Error cambiando contraseña:', error);
        this.toastr.error(error.error?.mensaje || 'Error al cambiar la contraseña', 'Error');
      },
      complete: () => {
        this.guardando = false;
      }
    });
  }
}
