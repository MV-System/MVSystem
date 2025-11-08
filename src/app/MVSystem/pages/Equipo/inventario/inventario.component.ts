import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/auth/login.service';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';
import { UserTrackingService } from 'src/app/core/services/user-tracking.service';
import { InventarioService } from 'src/app/core/services/inventario.service';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { Almacen } from 'src/app/core/interfaces/catalogo.interface';
import {
  InventarioSesion,
  InventarioEquipo,
  IniciarInventarioDTO,
  RegistrarEscaneoDTO
} from 'src/app/core/interfaces/inventario.interface';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit, OnDestroy {
  @ViewChild('imeiInput') imeiInput!: ElementRef;

  // Estado de la sesión
  sesionActiva: InventarioSesion | null = null;
  inventariosActivos: InventarioSesion[] = [];

  // Listas de equipos
  equiposPendientes: InventarioEquipo[] = [];
  equiposEscaneados: InventarioEquipo[] = [];

  // Búsqueda
  busquedaPendientes: string = '';
  busquedaEscaneados: string = '';

  // Formularios
  formIniciar: FormGroup;
  formEscanear: FormGroup;
  formFinalizar: FormGroup;

  // Catálogos
  almacenes: Almacen[] = [];

  // Estado UI
  vistaActual: 'seleccion' | 'escaneo' | 'resumen' = 'seleccion';
  ultimoEscaneado: InventarioEquipo | null = null;
  timerSubscription?: Subscription;
  duracionFormato: string = '00:00:00';

  // Modal de detalles
  mostrarModalDetalles: boolean = false;
  tituloModalDetalles: string = '';
  equiposDetalles: InventarioEquipo[] = [];
  tipoDetalles: 'faltantes' | 'sobrantes' | null = null;

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    private catalogosService: CatalogosService,
    private loginService: LoginService,
    private toastr: ToastrService,
    private loading: LoadingService,
    private tracking: UserTrackingService
  ) {
    this.formIniciar = this.fb.group({
      almacen: ['', Validators.required]
    });

    this.formEscanear = this.fb.group({
      imei: ['', Validators.required]
    });

    this.formFinalizar = this.fb.group({
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarAlmacenes();
    this.cargarInventariosActivos();
    this.tracking.trackPageView('MNU_MANT_PASARINVEQ', 'PageView').subscribe();
  }

  ngOnDestroy(): void {
    this.detenerTimer();
  }

  // ===================================
  // CARGA INICIAL
  // ===================================

  cargarAlmacenes(): void {
    this.catalogosService.getAlmaceLista().subscribe({
      next: (almacenes: Almacen[]) => {
        this.almacenes = almacenes;
      },
      error: (err: any) => {
        this.toastr.error('Error al cargar almacenes', 'Error');
        console.error(err);
      }
    });
  }

  cargarInventariosActivos(): void {
    console.log('🔍 INVENTARIO - Cargando inventarios activos...');

    this.inventarioService.obtenerInventariosActivos().subscribe({
      next: (inventarios) => {
        console.log('✅ INVENTARIO - Inventarios activos cargados:', inventarios);
        console.log('📊 INVENTARIO - Cantidad de inventarios:', inventarios.length);

        // Log detallado de cada inventario
        inventarios.forEach((inv, index) => {
          console.log(`📋 INVENTARIO ${index + 1} - ID: ${inv.iD_Sesion}, Estado: ${inv.estado}, Almacén: ${inv.iD_Almacen}`);
        });

        this.inventariosActivos = inventarios;

        // AUTO-CARGAR: Si hay un inventario EN_PROCESO, cargarlo automáticamente
        const inventarioEnProceso = inventarios.find(inv => inv.estado === 'EN_PROCESO');
        if (inventarioEnProceso) {
          console.log('🔄 INVENTARIO - Detectado inventario EN_PROCESO, cargando automáticamente...', inventarioEnProceso);
          this.toastr.info(`Continuando con inventario en proceso del almacén ${inventarioEnProceso.nombre_Almacen || inventarioEnProceso.iD_Almacen}`, 'Inventario Activo', { timeOut: 3000 });

          // Cargar el inventario automáticamente
          setTimeout(() => {
            this.cargarSesion(inventarioEnProceso.iD_Sesion);
          }, 500);
        }
      },
      error: (err) => {
        console.error('❌ INVENTARIO - Error al cargar inventarios activos:', err?.error?.message || err);
        console.error('� INVENTARIO - Status HTTP:', err?.status);
        console.error('🔧 INVENTARIO - URL llamada:', err?.url);
      }
    });
  }

  // ===================================
  // INICIAR INVENTARIO
  // ===================================

  iniciarInventario(): void {
    if (this.formIniciar.invalid) {
      this.toastr.warning('Seleccione un almacén', 'Atención');
      return;
    }

    const dto: IniciarInventarioDTO = {
      iD_Almacen: this.formIniciar.value.almacen,
      iD_Empresa: 15,
      iD_Sucursal: 1,
      usuario: 'mvpruebas'
    };

    console.log('🚀 INVENTARIO - Iniciando nueva sesión con DTO:', dto);

    this.loading.showLoading();
    this.inventarioService.iniciarSesion(dto).subscribe({
      next: (response) => {
        console.log('✅ INVENTARIO - Sesión iniciada exitosamente:', response);
        console.log('📦 INVENTARIO - Total equipos esperados:', response.total_Esperados);
        console.log('🆔 INVENTARIO - ID Sesión creada:', response.iD_Sesion);

        this.toastr.success(
          `Inventario iniciado: ${response.total_Esperados} equipos esperados`,
          'Éxito'
        );

        this.cargarSesion(response.iD_Sesion);
        this.tracking.trackAction('MNU_MANT_PASARINVEQ', 'Iniciar Inventario').subscribe();
        this.loading.hideLoading();
      },
      error: (err: any) => {
        console.error('❌ INVENTARIO - Error al iniciar sesión:', err?.error?.message || err);
        console.error('🔧 INVENTARIO - Status HTTP:', err?.status);
        console.error('🔧 INVENTARIO - DTO enviado:', dto);

        this.loading.hideLoading();
        this.toastr.error(err.error?.message || 'Error al iniciar inventario', 'Error');
      }
    });
  }

  reanudarInventario(idSesion: number): void {
    console.log('🔄 INVENTARIO - Reanudando inventario ID:', idSesion);

    // Buscar el inventario en la lista para mostrar su estado actual
    const inventario = this.inventariosActivos.find(inv => inv.iD_Sesion === idSesion);
    if (inventario) {
      console.log('📋 INVENTARIO - Estado actual:', inventario.estado);
      console.log('📋 INVENTARIO - Datos completos:', inventario);

      if (inventario.estado !== 'PAUSADO') {
        console.warn('⚠️ INVENTARIO - El inventario NO está en estado PAUSADO, está en:', inventario.estado);
        this.toastr.warning(`El inventario está en estado ${inventario.estado}. Solo se pueden reanudar inventarios pausados.`, 'Advertencia');
        return;
      }
    } else {
      console.warn('⚠️ INVENTARIO - No se encontró el inventario en la lista de activos');
    }

    this.loading.showLoading();
    const dto = {
      iD_Sesion: idSesion,
      usuario: this.loginService.getUserName()
    };

    console.log('📤 INVENTARIO - DTO reanudar:', dto);

    this.inventarioService.reanudarInventario(dto).subscribe({
      next: (response) => {
        console.log('✅ INVENTARIO - Reanudación exitosa:', response);
        this.cargarSesion(idSesion);
        this.loading.hideLoading();
        this.toastr.success('Inventario reanudado correctamente', 'Éxito');
        this.tracking.trackAction('MNU_MANT_PASARINVEQ', 'Reanudar Inventario').subscribe();
      },
      error: (err: any) => {
        console.error('❌ INVENTARIO - Error al reanudar:', err?.error?.message || err);
        console.error('� INVENTARIO - Status HTTP:', err?.status);
        console.error('🔧 INVENTARIO - DTO enviado:', dto);

        this.loading.hideLoading();
        const errorMsg = err.error?.message || err.message || 'Error desconocido al reanudar inventario';
        this.toastr.error(errorMsg, 'Error');
      }
    });
  }

  cargarSesion(idSesion: number): void {
    this.inventarioService.obtenerSesion(idSesion).subscribe({
      next: (sesion) => {
        this.sesionActiva = sesion;
        this.vistaActual = 'escaneo';
        this.cargarEquiposPendientes();
        this.cargarEquiposEscaneados();
        this.iniciarTimer();

        // Auto-focus en campo de escaneo
        setTimeout(() => this.focusImeiInput(), 500);
      },
      error: (err) => {
        this.toastr.error('Error al cargar sesión', 'Error');
        console.error(err);
      }
    });
  }

  // ===================================
  // ESCANEO DE EQUIPOS
  // ===================================

  escanearEquipo(): void {
    if (this.formEscanear.invalid || !this.sesionActiva) {
      return;
    }

    const imei = this.formEscanear.value.imei.trim();

    if (!imei) {
      return;
    }

    const dto: RegistrarEscaneoDTO = {
      iD_Sesion: this.sesionActiva.iD_Sesion,
      imei: imei,
      usuario: this.loginService.getUserName()
    };

    this.inventarioService.registrarEscaneo(dto).subscribe({
      next: (response) => {
        if (response.resultado === 'ERROR') {
          this.toastr.error(response.mensaje, 'Error');
          this.reproducirSonidoError();
        } else {
          this.toastr.success(response.mensaje, '✅ Escaneado');
          this.reproducirSonidoExito();

          // Actualizar listas
          this.cargarEquiposPendientes();
          this.cargarEquiposEscaneados();

          // Actualizar contadores de sesión
          this.actualizarSesion();

          // 📊 Tracking
          this.tracking.trackAction('MNU_MANT_PASARINVEQ', `Escaneo ${response.resultado}`).subscribe();
        }

        // Limpiar campo y enfocar
        this.formEscanear.reset();
        setTimeout(() => this.focusImeiInput(), 100);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Error al registrar escaneo', 'Error');
        this.reproducirSonidoError();
        console.error(err);

        // Limpiar y enfocar
        this.formEscanear.reset();
        setTimeout(() => this.focusImeiInput(), 100);
      }
    });
  }

  cargarEquiposPendientes(): void {
    if (!this.sesionActiva) return;

    this.inventarioService.obtenerPendientes(this.sesionActiva.iD_Sesion).subscribe({
      next: (equipos) => {
        this.equiposPendientes = equipos;
      },
      error: (err) => console.error('Error al cargar pendientes:', err)
    });
  }

  cargarEquiposEscaneados(): void {
    if (!this.sesionActiva) return;

    this.inventarioService.obtenerEscaneados(this.sesionActiva.iD_Sesion).subscribe({
      next: (equipos) => {
        this.equiposEscaneados = equipos;
        if (equipos.length > 0) {
          this.ultimoEscaneado = equipos[0]; // El más reciente
        }
      },
      error: (err) => console.error('Error al cargar escaneados:', err)
    });
  }

  actualizarSesion(): void {
    if (!this.sesionActiva) return;

    this.inventarioService.obtenerSesion(this.sesionActiva.iD_Sesion).subscribe({
      next: (sesion) => {
        this.sesionActiva = sesion;
      },
      error: (err) => console.error('Error al actualizar sesión:', err)
    });
  }

  // ===================================
  // FINALIZAR INVENTARIO
  // ===================================

  finalizarInventario(): void {
    if (!this.sesionActiva) return;

    if (!confirm(`¿Está seguro de finalizar el inventario?\n\nEscaneados: ${this.sesionActiva.total_Escaneados}\nPendientes: ${this.equiposPendientes.length}\n\nLos equipos NO escaneados serán marcados como NO DISPONIBLES.`)) {
      return;
    }

    this.loading.showLoading();
    this.inventarioService.finalizarInventario({
      iD_Sesion: this.sesionActiva.iD_Sesion,
      usuario: this.loginService.getUserName(),
      observaciones: this.formFinalizar.value.observaciones
    }).subscribe({
      next: (response) => {
        console.log('✅ INVENTARIO - Finalización exitosa:', response);
        this.loading.hideLoading();
        this.toastr.success(response.mensaje, 'Inventario Finalizado');
        this.detenerTimer();

        // IMPORTANTE: Recargar la sesión para obtener los totales actualizados
        if (this.sesionActiva) {
          this.inventarioService.obtenerSesion(this.sesionActiva.iD_Sesion).subscribe({
            next: (sesionActualizada) => {
              console.log('📊 INVENTARIO - Sesión actualizada:', sesionActualizada);
              this.sesionActiva = sesionActualizada;
              this.vistaActual = 'resumen';
            },
            error: (err) => {
              console.error('❌ Error al recargar sesión:', err);
              // Aunque falle la recarga, mostrar resumen
              this.vistaActual = 'resumen';
            }
          });
        }

        // 📊 Tracking
        this.tracking.trackAction('MNU_MANT_PASARINVEQ', 'Finalizar Inventario').subscribe();
      },
      error: (err: any) => {
        this.loading.hideLoading();
        this.toastr.error(err.error?.message || 'Error al finalizar inventario', 'Error');
        console.error(err);
      }
    });
  }

  pausarInventario(): void {
    if (!this.sesionActiva) return;

    this.inventarioService.pausarInventario({
      iD_Sesion: this.sesionActiva.iD_Sesion,
      usuario: this.loginService.getUserName()
    }).subscribe({
      next: () => {
        this.toastr.info('Inventario pausado', 'Info');
        this.detenerTimer();
        this.volverASeleccion();

        // 📊 Tracking
        this.tracking.trackAction('MNU_MANT_PASARINVEQ', 'Pausar Inventario').subscribe();
      },
      error: (err) => {
        this.toastr.error('Error al pausar inventario', 'Error');
        console.error(err);
      }
    });
  }

  cancelarInventario(idSesion: number): void {
    console.log('🗑️ INVENTARIO - Cancelando inventario ID:', idSesion);

    if (!confirm('¿Está seguro de cancelar este inventario? Esta acción no se puede deshacer.')) {
      console.log('❌ INVENTARIO - Usuario canceló confirmación');
      return;
    }

    this.loading.showLoading();
    this.inventarioService.cancelarInventario(idSesion).subscribe({
      next: (response) => {
        console.log('✅ INVENTARIO - Cancelación exitosa:', response);
        this.toastr.success('Inventario cancelado correctamente', 'Éxito');
        this.cargarInventariosActivos();
        this.tracking.trackAction('MNU_MANT_PASARINVEQ', 'Cancelar Inventario').subscribe();
      },
      error: (err) => {
        console.error('❌ INVENTARIO - Error al cancelar:', err?.error?.message || err);
        console.error('� INVENTARIO - Status HTTP:', err?.status);

        const errorMsg = err.error?.message || err.message || 'Error desconocido al cancelar inventario';
        this.toastr.error(errorMsg, 'Error');
      },
      complete: () => {
        console.log('🏁 INVENTARIO - Operación completada');
        this.loading.hideLoading();
      }
    });
  }

  // ===================================
  // NAVEGACIÓN
  // ===================================

  volverASeleccion(): void {
    this.vistaActual = 'seleccion';
    this.sesionActiva = null;
    this.equiposPendientes = [];
    this.equiposEscaneados = [];
    this.formIniciar.reset();
    this.cargarInventariosActivos();
    this.detenerTimer();
  }

  nuevoInventario(): void {
    this.volverASeleccion();
  }

  // ===================================
  // UTILIDADES
  // ===================================

  get equiposPendientesFiltrados(): InventarioEquipo[] {
    if (!this.busquedaPendientes) {
      return this.equiposPendientes;
    }

    const busqueda = this.busquedaPendientes.toLowerCase();
    return this.equiposPendientes.filter(e =>
      e.imei?.toLowerCase().includes(busqueda) ||
      e.modelo?.toLowerCase().includes(busqueda) ||
      e.marca?.toLowerCase().includes(busqueda)
    );
  }

  get equiposEscaneadosFiltrados(): InventarioEquipo[] {
    if (!this.busquedaEscaneados) {
      return this.equiposEscaneados;
    }

    const busqueda = this.busquedaEscaneados.toLowerCase();
    return this.equiposEscaneados.filter(e =>
      e.imei?.toLowerCase().includes(busqueda) ||
      e.modelo?.toLowerCase().includes(busqueda) ||
      e.marca?.toLowerCase().includes(busqueda)
    );
  }

  get porcentajeProgreso(): number {
    if (!this.sesionActiva || this.sesionActiva.total_Esperados === 0) {
      return 0;
    }
    return (this.sesionActiva.total_Escaneados / this.sesionActiva.total_Esperados) * 100;
  }

  iniciarTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.sesionActiva?.fecha_Inicio) {
        const inicio = new Date(this.sesionActiva.fecha_Inicio).getTime();
        const ahora = new Date().getTime();
        const diff = ahora - inicio;

        const horas = Math.floor(diff / 3600000);
        const minutos = Math.floor((diff % 3600000) / 60000);
        const segundos = Math.floor((diff % 60000) / 1000);

        this.duracionFormato = `${this.pad(horas)}:${this.pad(minutos)}:${this.pad(segundos)}`;
      }
    });
  }

  detenerTimer(): void {
    this.timerSubscription?.unsubscribe();
  }

  pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  focusImeiInput(): void {
    this.imeiInput?.nativeElement?.focus();
  }

  reproducirSonidoExito(): void {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGnOD0u2YcBjOO1vLRgC0FIXjE8N+TQQU='); // Sonido simple de éxito
    audio.play().catch(e => console.log('No se pudo reproducir sonido'));
  }

  reproducirSonidoError(): void {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgg=='); // Sonido de error
    audio.play().catch(e => console.log('No se pudo reproducir sonido'));
  }

  // ===================================
  // DETALLES DE FALTANTES/SOBRANTES
  // ===================================

  verDetallesFaltantes(): void {
    if (!this.sesionActiva || this.sesionActiva.total_Faltantes === 0) return;

    this.loading.showLoading();
    this.inventarioService.obtenerEquiposFaltantes(this.sesionActiva.iD_Sesion).subscribe({
      next: (equipos) => {
        this.equiposDetalles = equipos;
        this.tituloModalDetalles = `Equipos Faltantes (${equipos.length})`;
        this.tipoDetalles = 'faltantes';
        this.mostrarModalDetalles = true;
        this.loading.hideLoading();
      },
      error: (err) => {
        console.error('Error al cargar equipos faltantes:', err);
        this.toastr.error('Error al cargar equipos faltantes', 'Error');
        this.loading.hideLoading();
      }
    });
  }

  verDetallesSobrantes(): void {
    if (!this.sesionActiva || this.sesionActiva.total_Sobrantes === 0) return;

    this.loading.showLoading();
    this.inventarioService.obtenerEquiposSobrantes(this.sesionActiva.iD_Sesion).subscribe({
      next: (equipos) => {
        this.equiposDetalles = equipos;
        this.tituloModalDetalles = `Equipos Sobrantes (${equipos.length})`;
        this.tipoDetalles = 'sobrantes';
        this.mostrarModalDetalles = true;
        this.loading.hideLoading();
      },
      error: (err) => {
        console.error('Error al cargar equipos sobrantes:', err);
        this.toastr.error('Error al cargar equipos sobrantes', 'Error');
        this.loading.hideLoading();
      }
    });
  }

  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.equiposDetalles = [];
    this.tipoDetalles = null;
  }
}
