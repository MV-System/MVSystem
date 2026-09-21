// Eliminado getter duplicado fuera de la clase
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PreFacturasService, PreFactura } from 'src/app/core/services/prefacturas.service';
import { LoginService } from 'src/app/auth/login.service';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { FacturaFilter } from 'src/app/core/interfaces/mantenimiento';
import { ToastrService } from 'ngx-toastr';
import { RDialogService } from 'src/app/shared/components/r-dialog/r-dialog.service';
import { UserTrackingService } from 'src/app/core/services/user-tracking.service';
import { DetallePago } from '../facturacion-registro/pago-mixto/pago-mixto.component';

@Component({
  selector: 'app-caja-lista',
  templateUrl: './caja-lista.component.html',
  styleUrls: ['./caja-lista.component.css']
})
export class CajaListaComponent implements OnInit {
  /**
   * Detecta si la pantalla es móvil (ancho menor a 600px)
   */
  isMobileScreen(): boolean {
    return window.innerWidth < 600;
  }
  rebajarItem(det: any): void {
    const numeroPreFactura = this.selectedRowIndex !== null && this.preFacturas[this.selectedRowIndex]
      ? this.preFacturas[this.selectedRowIndex].numero_PreFactura
      : det.NumeroPreFactura || det.numeroPreFactura;
    const idEquipo = det.ID_Equipo || det.iD_Equipo;
    if (!numeroPreFactura || !idEquipo) {
      this.toast.error('No se pudo identificar el item a rebajar.');
      return;
    }
    this.rDialogService.openDialog(
      'Confirmar acción',
      `¿Está seguro que desea rebajar el item con código ${idEquipo}?`,
      () => {
        this.detalleLoading = true;
        this.preFacturasService.rebajarItemDetallePrefactura(numeroPreFactura, idEquipo).subscribe({
          next: (resp) => {
            this.toast.success(resp?.Mensaje || 'Ítem rebajado correctamente.');
            // Refrescar el detalle de la prefactura
            this.preFacturasService.obtenerDetallePreFactura(numeroPreFactura).subscribe({
              next: (data) => {
                this.detallePrefactura = data;
                this.detalleLoading = false;
                // Refrescar la lista general para actualizar totales
                this.cargarPreFacturasConAjustePago(numeroPreFactura);
              },
              error: () => {
                this.detalleError = 'Error al recargar el detalle.';
                this.detalleLoading = false;
              }
            });
          },
          error: (err) => {
            this.toast.error('No se pudo rebajar el ítem.');
            this.detalleLoading = false;
          }
        });
      },
      undefined,
      'Cancelar',
      'Rebajar'
    );
  }
  get totalPrefacturado(): number {
    return this.preFacturas.reduce((acc, pf) => acc + (pf.total || 0), 0);
  }
  subs: any[] = [];
  facturaNumberReporte: number | null = null;
  @Output() imprimirFactura = new EventEmitter<number>();
  preFacturas: PreFactura[] = [];
  tiposPagos: any[] = [];
  loading = false;
  error: string | null = null;
  accionEnCurso: number | null = null;
  mensaje: string | null = null;

  // Propiedades para paginación y selección
  pageSize: number = 10;
  pageIndex: number = 1;
  selectedRowIndex: number | null = null;
    expandedRowIndex: number | null = null;
    detallePrefactura: any[] = [];
    detallesPagosPorPrefactura: { [key: number]: DetallePago[] } = {};
    pagosGuardadosPorPrefactura: { [key: number]: boolean } = {};
    pagosLoadingPorPrefactura: { [key: number]: boolean } = {};
    detalleLoading: boolean = false;
    detalleError: string | null = null;

    get totalPages(): number {
    return Math.max(1, Math.ceil(this.preFacturas.length / this.pageSize));
  }

  // Filtro de búsqueda
  criterio: string = '';
  minSearchLength: number = 1;
  debounceTime: number = 800;
  private searchTimeout: any;

  onPageSizeChange(): void {
    this.pageIndex = 1;
  }

  handleClick(numeroPreFactura: number, index: number): void {
    this.selectedRowIndex = index;
    if (this.expandedRowIndex === index) {
      // Collapse if already expanded
      this.expandedRowIndex = null;
      this.detallePrefactura = [];
      this.detalleError = null;
    } else {
      this.expandedRowIndex = index;
      this.detalleLoading = true;
      this.detalleError = null;
      this.preFacturasService.obtenerDetallePreFactura(numeroPreFactura).subscribe({
        next: (data) => {
          this.detallePrefactura = data;
          this.detalleLoading = false;
        },
        error: (err) => {
          this.detalleError = 'Error al cargar el detalle de la pre-factura.';
          this.detalleLoading = false;
        }
      });
      const prefactura = this.preFacturas[index];
      if (prefactura?.iD_Tipo_Pagos === 6) {
        this.pagosLoadingPorPrefactura[numeroPreFactura] = true;
        this.cargarDetallesPago(numeroPreFactura);
      }
    }
  }

  cargarDetallesPago(numeroPreFactura: number): void {
    this.mantenimientoService.getDesglosePagos(numeroPreFactura, 'P').subscribe({
      next: (pagos) => {
        this.pagosLoadingPorPrefactura[numeroPreFactura] = false;
        this.pagosGuardadosPorPrefactura[numeroPreFactura] = !!pagos?.length;
        this.detallesPagosPorPrefactura[numeroPreFactura] = (pagos || []).map(pago => ({
          ID_Tipo_Pago: pago.iD_Tipo_Pago,
          Descripcion_Tipo_Pago: pago.descripcion_Tipo_Pago,
          Monto_Pago: pago.monto_Pago,
          Numero_Referencia: pago.numero_Referencia,
          Observacion: pago.observacion
        }));
      },
      error: () => {
        this.pagosLoadingPorPrefactura[numeroPreFactura] = false;
        this.pagosGuardadosPorPrefactura[numeroPreFactura] = false;
        this.detallesPagosPorPrefactura[numeroPreFactura] = [];
      }
    });
  }

  pagosCargando(numeroPreFactura: number): boolean {
    return !!this.pagosLoadingPorPrefactura[numeroPreFactura];
  }

  getDetallesPago(numeroPreFactura: number): DetallePago[] {
    return this.detallesPagosPorPrefactura[numeroPreFactura] || [];
  }

  onPagosMixtoChange(numeroPreFactura: number, pagos: DetallePago[]): void {
    this.detallesPagosPorPrefactura[numeroPreFactura] = pagos;
  }

  guardarPagosMixtos(prefactura: PreFactura): void {
    const pagos = (this.getDetallesPago(prefactura.numero_PreFactura) || []).map(pago => {
      const idTipoPago = Number(pago?.ID_Tipo_Pago ?? 0);
      const montoPago = Number(pago?.Monto_Pago ?? 0);

      return {
        ...pago,
        ID_Tipo_Pago: idTipoPago,
        Monto_Pago: Number.isFinite(montoPago) ? montoPago : 0,
        Numero_Referencia: pago?.Numero_Referencia ?? '',
        Observacion: pago?.Observacion ?? ''
      };
    });

    const pagosConDatos = pagos.filter(pago => Number(pago.ID_Tipo_Pago) > 0 || Number(pago.Monto_Pago) > 0);

    console.log('DEBUG_GUARDAR_PAGOS', {
      numeroPreFactura: prefactura.numero_PreFactura,
      totalFactura: prefactura.total,
      pagos,
      pagosConDatos
    });

    const suma = pagosConDatos.reduce((total, pago) => total + (Number.isFinite(pago.Monto_Pago) ? Number(pago.Monto_Pago) : 0), 0);
    const totalFactura = Number(prefactura.total || 0);
    const diferencia = Number((suma - totalFactura).toFixed(2));
    const tipos = pagosConDatos.map(pago => Number(pago.ID_Tipo_Pago));

    if (pagosConDatos.length < 2) {
      this.toast.error('Debe definir al menos 2 métodos de pago para una prefactura mixta.');
      return;
    }

    if (pagosConDatos.some(pago => {
      const idTipoPago = Number(pago?.ID_Tipo_Pago ?? 0);
      const montoPago = Number(pago?.Monto_Pago ?? 0);
      return !Number.isFinite(idTipoPago) || idTipoPago <= 0 || !Number.isFinite(montoPago) || montoPago <= 0;
    })) {
      this.toast.error('Cada método de pago debe tener un tipo y un monto mayor que cero.');
      return;
    }

    if (new Set(tipos).size !== tipos.length) {
      this.toast.error('No se puede repetir el mismo tipo de pago en un pago mixto.');
      return;
    }

    if (Math.abs(diferencia) > 0.01) {
      const signo = diferencia > 0 ? 'sobran' : 'faltan';
      const valor = Math.abs(diferencia).toFixed(2);
      this.toast.error(`Los pagos mixtos no coinciden con el total. ${signo} RD$ ${valor}.`);
      return;
    }

    this.preFacturasService.guardarDetallesPagoPreFactura(prefactura.numero_PreFactura, pagosConDatos).subscribe({
      next: () => {
        this.pagosGuardadosPorPrefactura[prefactura.numero_PreFactura] = true;
        this.toast.success('Pagos mixtos guardados correctamente');
        setTimeout(() => window.location.reload(), 500);
      },
      error: () => this.toast.error('No se pudieron guardar los pagos mixtos')
    });
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.criterio = target.value.trim();
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.executeSearch(this.criterio);
    }, this.debounceTime);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      this.executeSearch(this.criterio);
    }
  }

  clearSearch(): void {
    this.criterio = '';
    this.executeSearch('');
  }

  searchManually(): void {
    this.executeSearch(this.criterio);
  }

  executeSearch(searchTerm: string): void {
    if (searchTerm.length >= this.minSearchLength || searchTerm.length === 0) {
      this.loading = true;
      this.preFacturasService.listarPreFacturas({ Estado: 'P', criterio: searchTerm }).subscribe({
        next: (data) => {
          this.preFacturas = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al buscar pre-facturas';
          this.loading = false;
        }
      });
    }
  }

  constructor(
    private preFacturasService: PreFacturasService,
    private loginService: LoginService,
    private mantenimientoService: MantenimientoService,
    private toast: ToastrService,
    private rDialogService: RDialogService,
    private tracking: UserTrackingService
  ) {}

  ngOnInit(): void {
    this.cargarTiposPagos();
    this.cargarPreFacturas();

    // 📊 Tracking: Registro de acceso al módulo
    this.tracking.trackPageView('MNU_CONS_PREFACTURAS', 'PageView').subscribe();
  }

  cargarTiposPagos(): void {
    this.mantenimientoService.Tipos_Pagos_Cata_Consulta_Combo().subscribe({
      next: (data: any[]) => {
        // Excluir solo Crédito; Mixto se administra con el desglose existente.
        this.tiposPagos = (data || []).filter(tipo => tipo.iD_Tipo_Pagos !== 2);
      },
      error: (err: any) => {
        this.toast.error('Error al cargar tipos de pago');
      }
    });
  }

  actualizarTipoPagoPreFactura(prefactura: PreFactura, nuevoIdTipoPago: number | string): void {
    const idTipoPago = typeof nuevoIdTipoPago === 'string' ? parseInt(nuevoIdTipoPago) : nuevoIdTipoPago;
    const tipoPagoAnterior = prefactura.iD_Tipo_Pagos; // Guardar el valor anterior

    if (idTipoPago === tipoPagoAnterior) {
      return; // Sin cambios
    }

    this.rDialogService.openDialog(
      'Confirmar cambio',
      `¿Está seguro que desea cambiar el tipo de pago?`,
      () => {
        this.preFacturasService.actualizarTipoPagoPreFactura(prefactura.numero_PreFactura, idTipoPago).subscribe({
          next: (resp) => {
            // Sincronizar el estado local inmediatamente para que la UI reaccione sin refrescar.
            prefactura.iD_Tipo_Pagos = idTipoPago;

            if (idTipoPago === 6) {
              this.expandedRowIndex = this.preFacturas.indexOf(prefactura);
              this.cargarDetallesPago(prefactura.numero_PreFactura);
            } else {
              delete this.detallesPagosPorPrefactura[prefactura.numero_PreFactura];
              delete this.pagosGuardadosPorPrefactura[prefactura.numero_PreFactura];
            }
            this.toast.success('Tipo de pago actualizado correctamente');
          },
          error: (err) => {
            this.toast.error('Error al actualizar tipo de pago');
            // Revertir el cambio en el dropdown si falla
            prefactura.iD_Tipo_Pagos = tipoPagoAnterior;
          }
        });
      },
      () => {
        // Si cancela, revertir el cambio en el dropdown
        prefactura.iD_Tipo_Pagos = tipoPagoAnterior;
      }
    );
  }

  onTipoPagoChange(event: Event, prefactura: PreFactura): void {
    const select = event.target as HTMLSelectElement;
    if (select && select.value) {
      this.actualizarTipoPagoPreFactura(prefactura, select.value);
    }
  }

  cargarPreFacturas(): void {
    this.loading = true;
    this.error = null;

    this.preFacturasService.listarPreFacturas({ Estado: 'P' }).subscribe({
      next: (data) => {
        this.preFacturas = data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = `Error al cargar pre-facturas: ${err.status || 'Error de conexión'}`;
        this.preFacturas = [];
        this.loading = false;
        this.toast.error(this.error);
      }
    });
  }

  private cargarPreFacturasConAjustePago(numeroPreFactura: number): void {
    this.preFacturasService.listarPreFacturas({ Estado: 'P' }).subscribe({
      next: (data) => {
        this.preFacturas = data || [];
        const prefactura = this.preFacturas.find(p => p.numero_PreFactura === numeroPreFactura);
        if (prefactura?.iD_Tipo_Pagos === 6) {
          this.cargarDetallesPagoYAjustar(numeroPreFactura, prefactura.total);
        }
      },
      error: () => this.toast.error('No se pudo actualizar el total de la prefactura')
    });
  }

  private cargarDetallesPagoYAjustar(numeroPreFactura: number, nuevoTotal: number): void {
    this.mantenimientoService.getDesglosePagos(numeroPreFactura, 'P').subscribe({
      next: (pagos) => {
        const detalles = (pagos || []).map(pago => ({
          ID_Tipo_Pago: Number(pago.iD_Tipo_Pago),
          Descripcion_Tipo_Pago: pago.descripcion_Tipo_Pago,
          Monto_Pago: Number(pago.monto_Pago),
          Numero_Referencia: pago.numero_Referencia,
          Observacion: pago.observacion
        }));
        this.detallesPagosPorPrefactura[numeroPreFactura] = detalles;
        this.ajustarPagosPorNuevoTotal(numeroPreFactura, nuevoTotal);
      },
      error: () => this.toast.error('No se pudieron consultar los pagos de la prefactura')
    });
  }

  private ajustarPagosPorNuevoTotal(numeroPreFactura: number, nuevoTotal: number): void {
    const pagos = this.getDetallesPago(numeroPreFactura).map(pago => ({ ...pago }));
    let diferencia = pagos.reduce((total, pago) => total + pago.Monto_Pago, 0) - Number(nuevoTotal);

    if (diferencia <= 0.01) return;

    pagos.sort((primerPago, segundoPago) => segundoPago.Monto_Pago - primerPago.Monto_Pago);
    for (const pago of pagos) {
      if (diferencia <= 0.01) break;
      const descuento = Math.min(pago.Monto_Pago, diferencia);
      pago.Monto_Pago = Number((pago.Monto_Pago - descuento).toFixed(2));
      diferencia = Number((diferencia - descuento).toFixed(2));
    }

    this.detallesPagosPorPrefactura[numeroPreFactura] = pagos;
    this.preFacturasService.guardarDetallesPagoPreFactura(numeroPreFactura, pagos).subscribe({
      next: () => this.toast.success('Pagos mixtos ajustados al nuevo total'),
      error: () => this.toast.error('No se pudieron ajustar los pagos mixtos')
    });
  }

  procesarPreFactura(id: number): void {
    this.accionEnCurso = id;
    this.mensaje = null;
    const usuarioProcesamiento = this.loginService.getUserName();
    this.preFacturasService.procesarPreFactura(id, usuarioProcesamiento).subscribe({
      next: (response) => {
        const mensajeApi = response?.mensaje;
        this.mensaje = mensajeApi;
        this.accionEnCurso = null;
        // Guardar el id de sucursal de la prefactura procesada
        const prefactura = this.preFacturas.find(p => p.numero_PreFactura === id);
        this.sucursalReporte = prefactura ? String(prefactura.iD_Sucursal) : null;
        // Limpiar detalle y expandido si corresponde
        this.detallePrefactura = [];
        this.expandedRowIndex = null;
        this.cargarPreFacturas();
        if (response && response.cod_Factura) {
          this.facturaNumberReporte = response.cod_Factura;
          if (this.isMobileScreen()) {
            // En móvil, preguntar si desea compartir la factura
            this.rDialogService.openDialog(
              'Aviso',
              mensajeApi + '\n¿Desea compartir la factura generada?',
              () => {
                this.compartirFactura(this.facturaNumberReporte!);
              },
              () => {},
              'No',
              'Sí'
            );
          } else {
            // Desktop: mantener impresión
            this.rDialogService.openDialog(
              '¿Imprimir factura?',
              mensajeApi + '\n¿Desea imprimir la factura generada?',
              () => {
                this.rDialogService.openDialog(
                  'Tipo de impresión',
                  '¿Cómo desea imprimir la factura?',
                  () => { this.printFacturaNormal(); },
                  () => { this.printFacturaMini(); },
                  'Mini',
                  'Normal'
                );
              },
              () => {},
              'No',
              'Sí'
            );
          }
        }
      },
      error: () => {
        this.mensaje = 'Error al procesar la pre-factura.';
        this.accionEnCurso = null;
      }
    });
  }

  /**
   * Compartir factura usando Web Share API (móvil)
   */
  compartirFactura(numeroFactura: number) {
    if (!numeroFactura || numeroFactura <= 0) {
      this.toast.error('Número de factura inválido');
      return;
    }
    if (!navigator.share) {
      this.toast.warning('Tu navegador no soporta la función de compartir. Usa un navegador moderno en tu dispositivo móvil.');
      return;
    }
    this.loading = true;
    const sub = this.mantenimientoService.postFacturaReport(this.modelFacturaFilter(), numeroFactura)
      .subscribe({
        next: async (blob) => {
          try {
            const fileName = `Factura_${numeroFactura}.pdf`;
            const file = new File([blob], fileName, { type: 'application/pdf' });
            try {
              await (navigator as any).share({
                title: `Factura #${numeroFactura}`,
                text: `Factura #${numeroFactura} - MVSystem`,
                files: [file]
              });
              this.toast.success('Factura compartida exitosamente');
            } catch (shareError: any) {
              if (shareError.name === 'NotAllowedError' || shareError.message?.includes('files')) {
                this.toast.warning('No se puede compartir el archivo. Se descargará en su lugar.');
                // Fallback: descargar
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }, 100);
              } else if (shareError.name !== 'AbortError') {
                this.toast.warning('Error al compartir. Descargando archivo...');
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }, 100);
              }
            }
          } catch (error: any) {
            this.toast.error('Error al preparar la factura para compartir');
          } finally {
            this.loading = false;
          }
        },
        error: (err) => {
          this.toast.error('Error al generar la factura para compartir');
          this.loading = false;
        }
      });
    this.subs.push(sub);
  }
  printFacturaMini(): void {
    this.loading = true;
    const sub = this.mantenimientoService.postFacturaMiniReport(this.modelFacturaFilter(), this.facturaNumberReporte!)
      .subscribe(blob => {
        const newBlob = new Blob([blob], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(newBlob);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = blobUrl;
        iframe.onload = () => {
          this.loading = false;
          iframe.contentWindow?.print();
        };
        document.body.appendChild(iframe);
      }, err => {
        this.loading = false;
        this.toast.error('Error al imprimir factura mini');
      });
    this.subs.push(sub);
  }
  sucursalReporte: string | null = null;

  printFacturaNormal(): void {
    this.loading = true;
    // Enviar todos los campos requeridos por FacturaFilter, pero solo IdSucursal es relevante
    const filter: FacturaFilter = {
      almacen: Number(this.loginService.getUserIdSucursal),
      criterio: '',
      empresa: this.loginService.getUserEmpresa,
      IdEmpresa: this.loginService.getUserIdEmpresa,
      IdSucursal: this.sucursalReporte ? this.sucursalReporte : '',
      ComprobanteCheck: 1,
      EstadoFactura: "A",
      IdVendedor: 0,
      numeroFactura: this.facturaNumberReporte!,
      pageIndex: 1,
      pageSize: 1,
      fechaInicio: '',
      fechaFinal: '',
      Usuario: this.loginService.getUserName(),
    };
    const sub = this.mantenimientoService.postFacturaReport(filter, this.facturaNumberReporte!)
      .subscribe(blob => {
        const newBlob = new Blob([blob], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(newBlob);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = blobUrl;
        iframe.onload = () => {
          this.loading = false;
          iframe.contentWindow?.print();
        };
        document.body.appendChild(iframe);
      }, err => {
        this.loading = false;
        this.toast.error('Error al imprimir factura');
      });
    this.subs.push(sub);
  }
  modelFacturaFilter(): FacturaFilter {
    //-------
    return {
      almacen: Number(this.loginService.getUserIdSucursal),
      criterio: '',
      empresa: this.loginService.getUserEmpresa,
      IdEmpresa: this.loginService.getUserIdEmpresa,
      IdSucursal: this.loginService.getUserIdSucursal,
      ComprobanteCheck: 1,
      IdVendedor: 0,
      numeroFactura: this.facturaNumberReporte!,
      pageIndex: 1,
      pageSize: 1,
      fechaInicio: '',
      fechaFinal: '',
       EstadoFactura: "A",// Valor por defecto, ajusta según lógica de tu app
       Usuario: this.loginService.getUserName(),
    };
  }

  // Método para obtener el componente de consulta de facturas
  getConsultaFacturasComponent(): any {
    // Ajusta esta lógica según cómo esté estructurada tu app (puede ser por ViewChild, servicio, etc.)
    // Ejemplo: si usas un servicio compartido, podrías accederlo aquí
    // return this.facturacionConsultaService.getComponentInstance();
    return null; // Implementa la referencia real aquí
  }

  anularPreFactura(id: number): void {
    this.accionEnCurso = id;
    this.mensaje = null;
    this.preFacturasService.anularPreFactura(id).subscribe({
      next: () => {
        this.mensaje = 'Pre-factura anulada correctamente.';
        this.accionEnCurso = null;
        this.cargarPreFacturas();
      },
      error: () => {
        this.mensaje = 'Error al anular la pre-factura.';
        this.accionEnCurso = null;
      }
    });
  }

  reimprimirPreFactura(pf: PreFactura): void {
    if (!pf.numero_PreFactura) return;
    this.rDialogService.openDialog(
      '¿Imprimir pre-factura?',
      '¿Desea imprimir la pre-factura?',
      () => {
        // Confirmó que desea imprimir, ahora pregunta el tipo
        this.rDialogService.openDialog(
          'Tipo de impresión',
          '¿Cómo desea imprimir la pre-factura?',
          () => { this.imprimirPreFacturaExistente(pf, true); },
          () => { this.imprimirPreFacturaExistente(pf, false); },
          'Mini',
          'Normal'
        );
      },
      () => {}, // Cancelar: no hacer nada
      'Cancelar',
      'Sí'
    );
  }

  private modelPreFacturaFilter(pf: PreFactura): FacturaFilter {
    return {
      almacen: Number(this.loginService.getUserIdSucursal),
      criterio: '',
      empresa: this.loginService.getUserEmpresa,
      IdEmpresa: this.loginService.getUserIdEmpresa,
      IdSucursal: pf.iD_Sucursal ? String(pf.iD_Sucursal) : this.loginService.getUserIdSucursal,
      ComprobanteCheck: 1,
      EstadoFactura: 'P',
      IdVendedor: 0,
      numeroFactura: pf.numero_PreFactura,
      pageIndex: 1,
      pageSize: 1,
      fechaInicio: '',
      fechaFinal: '',
      Usuario: this.loginService.getUserName(),
    };
  }

  private imprimirPreFacturaExistente(pf: PreFactura, normal: boolean): void {
    this.loading = true;
    const request$ = normal
      ? this.preFacturasService.postPreFacturaReport(this.modelPreFacturaFilter(pf), pf.numero_PreFactura)
      : this.preFacturasService.postPreFacturaMiniReport(this.modelPreFacturaFilter(pf), pf.numero_PreFactura);

    const sub = request$.subscribe(blob => {
      const newBlob = new Blob([blob], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(newBlob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      iframe.onload = () => {
        this.loading = false;
        iframe.contentWindow?.print();
      };
      document.body.appendChild(iframe);
    }, err => {
      this.loading = false;
      this.toast.error('Error al imprimir la pre-factura');
    });
    this.subs.push(sub);
  }
}
