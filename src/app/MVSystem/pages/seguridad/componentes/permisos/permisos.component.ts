import { Component, OnInit } from '@angular/core';
import { SeguridadService } from '../../servicios/seguridad.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.css']
})
export class PermisosComponent implements OnInit {
  permisos: any[] = [];
  modulos: any[] = [];
  loading = true;
  showModal = false;
  modalTitle = '';
  permisoSeleccionado: any = null;
  formulario: any = {
    codigo: null,
    nombre: '',
    descripcion: '',
    modulo: null,
    basico: false,
    estado: 1
  };

  constructor(
    private seguridadService: SeguridadService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.cargarPermisos();
    this.cargarModulos();
  }

  cargarPermisos(): void {
    this.loading = true;
    this.seguridadService.getPermisos().subscribe({
      next: (data) => {
        this.permisos = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando permisos:', error);
        this.toastr.error('Error al cargar los permisos', 'Error');
        this.loading = false;
      }
    });
  }

  cargarModulos(): void {
    this.seguridadService.getModulos().subscribe({
      next: (data) => {
        this.modulos = data;
      },
      error: (error) => {
        console.error('Error cargando módulos:', error);
      }
    });
  }

  abrirFormulario(): void {
    this.modalTitle = 'Crear Nuevo Permiso';
    this.permisoSeleccionado = null;
    this.formulario = {
      codigo: null,
      nombre: '',
      descripcion: '',
      modulo: null,
      basico: false,
      estado: 1
    };
    this.showModal = true;
  }

  editar(permiso: any): void {
    this.modalTitle = `Editar Permiso: ${permiso.nombre}`;
    this.permisoSeleccionado = permiso;
    this.formulario = { ...permiso };
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.permisoSeleccionado = null;
    this.formulario = {
      codigo: null,
      nombre: '',
      descripcion: '',
      modulo: null,
      basico: false,
      estado: 1
    };
  }

  guardarPermiso(): void {
    if (!this.formulario.nombre || !this.formulario.descripcion) {
      this.toastr.warning('Completa los campos requeridos', 'Validación');
      return;
    }

    const permiso = {
      codigo: this.formulario.codigo,
      nombre: this.formulario.nombre,
      descripcion: this.formulario.descripcion,
      modulo: this.formulario.modulo,
      basico: this.formulario.basico ? 1 : 0,
      estado: this.formulario.estado
    };

    if (this.permisoSeleccionado) {
      // Actualizar
      this.seguridadService.actualizarPermiso(permiso).subscribe({
        next: () => {
          this.toastr.success('Permiso actualizado correctamente', 'Éxito');
          this.cerrarModal();
          this.cargarPermisos();
        },
        error: (error) => {
          console.error('Error:', error);
          this.toastr.error('Error al actualizar el permiso', 'Error');
        }
      });
    } else {
      // Crear
      this.seguridadService.crearPermiso(permiso).subscribe({
        next: () => {
          this.toastr.success('Permiso creado correctamente', 'Éxito');
          this.cerrarModal();
          this.cargarPermisos();
        },
        error: (error) => {
          console.error('Error:', error);
          this.toastr.error('Error al crear el permiso', 'Error');
        }
      });
    }
  }

  eliminar(codigo: number): void {
    if (confirm('¿Deseas eliminar este permiso?')) {
      this.seguridadService.eliminarPermiso(codigo).subscribe({
        next: () => {
          this.toastr.success('Permiso eliminado correctamente', 'Éxito');
          this.cargarPermisos();
        },
        error: (error) => {
          console.error('Error eliminando permiso:', error);
          this.toastr.error('Error al eliminar el permiso', 'Error');
        }
      });
    }
  }
}
