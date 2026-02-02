import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SeguridadService } from '../../servicios/seguridad.service';
import { LoginService } from 'src/app/auth/login.service';

@Component({
  selector: 'app-asignaciones',
  templateUrl: './asignaciones.component.html',
  styleUrls: ['./asignaciones.component.css']
})
export class AsignacionesComponent implements OnInit {
  // Configuración de perfiles con acceso a todos los permisos
  readonly PERFILES_ACCESO_TOTAL = [3];

  usuarios: any[] = [];
  permisos: any[] = [];
  permisosFiltrados: any[] = [];
  loading = true;
  expandedUsuario: any = null;
  showModal = false;
  permisosSeleccionados: number[] = [];
  usuarioSeleccionado: any = null;
  busquedaPermiso = '';

  constructor(
    private seguridadService: SeguridadService,
    private toastr: ToastrService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.cargarUsuarios();
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

  cargarPermisos(): void {
    this.seguridadService.getPermisos().subscribe({
      next: (data) => {
        this.permisos = data;
        this.permisosFiltrados = [...this.permisos];
      },
      error: (error) => {
        console.error('Error cargando permisos:', error);
        this.toastr.error('Error al cargar los permisos', 'Error');
      }
    });
  }

  expandirUsuario(usuario: any): void {
    if (this.expandedUsuario?.codigo === usuario.codigo) {
      this.expandedUsuario = null;
    } else {
      this.expandedUsuario = usuario;
      this.cargarPermisosUsuario(usuario);
    }
  }

  cargarPermisosUsuario(usuario: any): void {
    this.seguridadService.obtenerPermisosEfectivos(usuario.codigo).subscribe({
      next: (data) => {
        usuario.permisosAsignados = data;
        // Guardar los códigos de permisos para uso posterior
        usuario.codigosPermisosAsignados = data.map((p: any) => p.codigo);

        // Si el modal está abierto con este usuario, actualizar también permisosSeleccionados
        if (this.showModal && this.usuarioSeleccionado?.codigo === usuario.codigo) {
          this.permisosSeleccionados = [...usuario.codigosPermisosAsignados];
          this.usuarioSeleccionado = { ...usuario }; // Forzar actualización de referencia
        }
      },
      error: (error) => {
        console.error('Error cargando permisos:', error);
        this.toastr.error('Error al cargar los permisos del usuario', 'Error');
      }
    });
  }

  abrirModalAsignarPermisos(usuario: any): void {
    this.usuarioSeleccionado = usuario;
    // Sincronizar los permisos seleccionados con los códigos que tiene el usuario
    if (usuario.codigosPermisosAsignados && usuario.codigosPermisosAsignados.length > 0) {
      this.permisosSeleccionados = [...usuario.codigosPermisosAsignados];
    } else {
      this.permisosSeleccionados = [];
    }
    this.busquedaPermiso = '';
    // Aplicar filtro según el perfil del usuario
    this.aplicarFiltroSegunPerfil();
    this.showModal = true;
  }

  aplicarFiltroSegunPerfil(): void {
    // Obtener el perfil del usuario logueado desde el token
    const tokenData = this.loginService.tokenDecoded;
    const perfilUsuarioLogueado = parseInt(tokenData?.Perfil, 10) || 0;

    console.log('Token Data completo:', tokenData);
    console.log('Perfil raw:', tokenData?.Perfil);
    console.log('Perfil parseado:', perfilUsuarioLogueado);
    console.log('¿Está en PERFILES_ACCESO_TOTAL?', this.PERFILES_ACCESO_TOTAL.includes(perfilUsuarioLogueado));
    console.log('PERFILES_ACCESO_TOTAL:', this.PERFILES_ACCESO_TOTAL);

    // Si el usuario logueado está en la lista de acceso total, mostrar todos los permisos
    if (this.PERFILES_ACCESO_TOTAL.includes(perfilUsuarioLogueado)) {
      console.log('✅ Mostrando TODOS los permisos');
      this.permisosFiltrados = [...this.permisos];
    } else {
      // Para otros perfiles, mostrar solo permisos básicos
      console.log('❌ Mostrando solo permisos básicos');
      this.permisosFiltrados = this.permisos.filter(p => {
        const esBasico = p.basico === true || p.basico === 1 || p.basico === '1';
        return esBasico;
      });
    }
    console.log('Permisos filtrados:', this.permisosFiltrados.length);
  }

  filtrarPermisos(): void {
    // Obtener el perfil del usuario logueado
    const tokenData = this.loginService.tokenDecoded;
    const perfilUsuarioLogueado = parseInt(tokenData?.Perfil, 10) || 0;

    // Primero obtener los permisos permitidos según el perfil del usuario logueado
    let permisosDisponibles: any[];
    if (this.PERFILES_ACCESO_TOTAL.includes(perfilUsuarioLogueado)) {
      permisosDisponibles = this.permisos;
    } else {
      permisosDisponibles = this.permisos.filter(p => {
        const esBasico = p.basico === true || p.basico === 1 || p.basico === '1';
        return esBasico;
      });
    }

    // Luego aplicar la búsqueda
    if (!this.busquedaPermiso.trim()) {
      this.permisosFiltrados = [...permisosDisponibles];
    } else {
      const termino = this.busquedaPermiso.toLowerCase();
      this.permisosFiltrados = permisosDisponibles.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.descripcion.toLowerCase().includes(termino) ||
        p.nombreModulo.toLowerCase().includes(termino)
      );
    }
  }

  seleccionarTodos(): void {
    // Usar permisosFiltrados para respetar búsqueda + filtro de perfil
    if (this.permisosSeleccionados.length === this.permisosFiltrados.length) {
      // Si todos están seleccionados, deseleccionar todos
      this.permisosSeleccionados = [];
    } else {
      // Seleccionar todos los permisos filtrados
      this.permisosSeleccionados = this.permisosFiltrados.map(p => p.codigo);
    }
  }

  cerrarModal(): void {
    this.showModal = false;
    this.usuarioSeleccionado = null;
    this.permisosSeleccionados = [];
  }

  alternarPermiso(codigoPermiso: number): void {
    const index = this.permisosSeleccionados.indexOf(codigoPermiso);
    if (index > -1) {
      this.permisosSeleccionados.splice(index, 1);
    } else {
      this.permisosSeleccionados.push(codigoPermiso);
    }
    // Forzar detección de cambios
    this.permisosSeleccionados = [...this.permisosSeleccionados];
  }

  guardarAsignaciones(): void {
    if (!this.usuarioSeleccionado) return;

    const codigoUsuario = this.usuarioSeleccionado.codigo;

    console.log('Permisos seleccionados:', this.permisosSeleccionados);
    console.log('Permisos que tenía:', this.usuarioSeleccionado.codigosPermisosAsignados);

    // Usar el nuevo método que modifica (agrega y elimina automáticamente)
    this.seguridadService.modificarPermisosUsuario(codigoUsuario, this.permisosSeleccionados).subscribe({
      next: () => {
        this.toastr.success('Permisos actualizados correctamente', 'Éxito');
        this.cerrarModal();
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error modificando permisos:', error);
        this.toastr.error('Error al actualizar los permisos', 'Error');
      }
    });
  }

  quitarPermiso(usuario: any, codigoPermiso: number): void {
    if (confirm('¿Deseas quitar este permiso?')) {
      this.seguridadService.desasignarPermisoUsuario(usuario.codigo, codigoPermiso).subscribe({
        next: () => {
          this.toastr.success('Permiso removido correctamente', 'Éxito');

          // Encontrar el usuario en la lista para actualizarlo correctamente
          const usuarioEnLista = this.usuarios.find(u => u.codigo === usuario.codigo);
          if (usuarioEnLista) {
            this.cargarPermisosUsuario(usuarioEnLista);

            // Forzar actualización de la referencia para que Angular detecte el cambio
            this.usuarios = [...this.usuarios];
          }

          // Si el modal está abierto y es el mismo usuario, actualizar permisosSeleccionados
          if (this.showModal && this.usuarioSeleccionado?.codigo === usuario.codigo) {
            const index = this.permisosSeleccionados.indexOf(codigoPermiso);
            if (index > -1) {
              this.permisosSeleccionados.splice(index, 1);
              this.permisosSeleccionados = [...this.permisosSeleccionados]; // Forzar detección de cambios
            }
          }
        },
        error: (error) => {
          console.error('Error:', error);
          this.toastr.error('Error al quitar el permiso', 'Error');
        }
      });
    }
  }
}
