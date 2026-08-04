// Eliminado getter duplicado fuera de la clase
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PreFacturasService, PreFactura } from 'src/app/core/services/prefacturas.service';
import { LoginService } from 'src/app/auth/login.service';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { FacturaFilter } from 'src/app/core/interfaces/mantenimiento';
import { ToastrService } from 'ngx-toastr';
import { RDialogService } from 'src/app/shared/components/r-dialog/r-dialog.service';
import { UserTrackingService } from 'src/app/core/services/user-tracking.service';

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
                this.cargarPreFacturas();
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
    }
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
    this.cargarPreFacturas();

    // 📊 Tracking: Registro de acceso al módulo
    this.tracking.trackPageView('MNU_CONS_PREFACTURAS', 'PageView').subscribe();
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
      'Tipo de impresión',
      '¿Cómo desea imprimir la pre-factura?',
      () => { this.imprimirPreFacturaExistente(pf, true); },
      () => { this.imprimirPreFacturaExistente(pf, false); },
      'Mini',
      'Normal'
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
