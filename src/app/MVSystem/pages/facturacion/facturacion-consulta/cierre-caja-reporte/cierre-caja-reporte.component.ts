import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CierreCajaReporteResumen, CierreCajaDetalleReporte } from 'src/app/core/interfaces/catalogo.interface';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { ToastrService } from 'ngx-toastr';
import { FacturaFilter } from 'src/app/core/interfaces/mantenimiento';
import { Subscription } from 'rxjs';
import { CreatorPDFFile } from 'src/app/helpers/helper';

@Component({
  selector: 'app-cierre-caja-reporte',
  templateUrl: './cierre-caja-reporte.component.html',
  styleUrls: ['./cierre-caja-reporte.component.css']
})
export class CierreCajaReporteComponent implements OnInit, OnDestroy, OnChanges {
  /**
   * Filtro a utilizar para obtener el reporte
   */
  @Input() filtro!: FacturaFilter;

  /**
   * Datos del reporte de cierre de caja
   */
  cierreCajaResumen: CierreCajaReporteResumen | null = null;

  /**
   * Estado de carga
   */
  isLoading = false;

  /**
   * Mensaje de error
   */
  error: string | null = null;

  /**
   * Array de suscripciones para limpiar
   */
  private subs: Subscription[] = [];

  /**
   * Último filtro procesado para detectar cambios reales
   */
  private ultimoFiltro: FacturaFilter | null = null;

  constructor(
    private mantenimientoService: MantenimientoService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    // Cargar reporte si se proporciona filtro
    if (this.filtro) {
      this.cargarCierreCaja();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si cambia el filtro, verificar si realmente cambió (no solo si es un objeto nuevo)
    if (changes['filtro'] && !changes['filtro'].firstChange) {
      const filtroActual = changes['filtro'].currentValue as FacturaFilter;

      // Comparar solo los campos relevantes del filtro
      if (this.filtrosCambiaron(this.ultimoFiltro, filtroActual)) {
        this.ultimoFiltro = { ...filtroActual };
        this.cargarCierreCaja();
      }
    } else if (changes['filtro'] && changes['filtro'].firstChange) {
      // En el primer cambio, guardar el filtro
      this.ultimoFiltro = { ...changes['filtro'].currentValue };
    }
  }

  /**
   * Compara si los filtros realmente cambiaron
   */
  private filtrosCambiaron(filtroAnterior: FacturaFilter | null, filtroNuevo: FacturaFilter): boolean {
    if (!filtroAnterior) {
      return true;
    }

    // Comparar los campos relevantes
    return (
      filtroAnterior.almacen !== filtroNuevo.almacen ||
      filtroAnterior.fechaInicio !== filtroNuevo.fechaInicio ||
      filtroAnterior.fechaFinal !== filtroNuevo.fechaFinal ||
      filtroAnterior.EstadoFactura !== filtroNuevo.EstadoFactura ||
      filtroAnterior.IdVendedor !== filtroNuevo.IdVendedor
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  /**
   * Carga el reporte de cierre de caja
   */
  cargarCierreCaja(): void {
    if (!this.filtro) {
      this.toast.warning('No hay filtros disponibles');
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.cierreCajaResumen = null;

    // Crear una copia del filtro para no modificar el original
    const filtroParaReporte = { ...this.filtro };

    // Si no hay fechas seleccionadas, usar la fecha actual
    if (!filtroParaReporte.fechaInicio || !filtroParaReporte.fechaFinal) {
      const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      filtroParaReporte.fechaInicio = hoy;
      filtroParaReporte.fechaFinal = hoy;
    }

    const sub = this.mantenimientoService.getCierreCajaReport(filtroParaReporte).subscribe({
      next: (resultado) => {
        if (resultado && resultado.detallesPorTipoPago && resultado.detallesPorTipoPago.length > 0) {
          this.cierreCajaResumen = resultado;
          this.isLoading = false;
        } else {
          this.error = 'No hay facturas en el período especificado';
          this.isLoading = false;
          this.toast.info('No hay datos para mostrar');
        }
      },
      error: (err) => {
        console.error('Error al cargar cierre de caja:', err);
        this.error = 'Error al cargar el reporte. Por favor, intente nuevamente.';
        this.isLoading = false;
        this.toast.error('Error al obtener el reporte de cierre de caja');
      }
    });

    this.subs.push(sub);
  }

  /**
   * Obtiene el icono según el tipo de pago
   */
  getIconoTipoPago(tipoPago: string): string {
    const tipoPagoLower = tipoPago.toLowerCase();

    if (tipoPagoLower.includes('contado')) return 'bi-cash-coin';
    if (tipoPagoLower.includes('crédito') || tipoPagoLower.includes('credito')) return 'bi-hourglass-split';
    if (tipoPagoLower.includes('transfer')) return 'bi-arrow-left-right';
    if (tipoPagoLower.includes('tarjeta')) return 'bi-credit-card';
    if (tipoPagoLower.includes('banco') || tipoPagoLower.includes('reservas') || tipoPagoLower.includes('popular')) return 'bi-bank';

    return 'bi-coin';
  }

  /**
   * Obtiene el color según el tipo de pago
   */
  getColorTipoPago(tipoPago: string): string {
    const tipoPagoLower = tipoPago.toLowerCase();

    if (tipoPagoLower.includes('contado')) return '#22c55e'; // Verde
    if (tipoPagoLower.includes('crédito') || tipoPagoLower.includes('credito')) return '#f59e0b'; // Ámbar
    if (tipoPagoLower.includes('transfer')) return '#3b82f6'; // Azul
    if (tipoPagoLower.includes('tarjeta')) return '#8b5cf6'; // Púrpura
    if (tipoPagoLower.includes('banco')) return '#06b6d4'; // Cyan

    return '#6b7280'; // Gris
  }

  /**
   * Formatea un número como moneda
   */
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor);
  }

  /**
   * Retorna si una fila es de crédito
   */
  esCredito(tipoPago: string): boolean {
    return tipoPago.toLowerCase().includes('crédito') || tipoPago.toLowerCase().includes('credito');
  }

  /**
   * Calcula la suma total de subtotales
   */
  getTotalSubtotal(): number {
    if (!this.cierreCajaResumen || !this.cierreCajaResumen.detallesPorTipoPago) {
      return 0;
    }
    return this.cierreCajaResumen.detallesPorTipoPago.reduce((sum, item) => sum + (item.subTotal || 0), 0);
  }

  /**
   * Calcula la suma total de descuentos
   */
  getTotalDescuentos(): number {
    if (!this.cierreCajaResumen || !this.cierreCajaResumen.detallesPorTipoPago) {
      return 0;
    }
    return this.cierreCajaResumen.detallesPorTipoPago.reduce((sum, item) => sum + (item.descuento || 0), 0);
  }

  /**
   * Calcula la suma total de ITBIS
   */
  getTotalITBIS(): number {
    if (!this.cierreCajaResumen || !this.cierreCajaResumen.detallesPorTipoPago) {
      return 0;
    }
    return this.cierreCajaResumen.detallesPorTipoPago.reduce((sum, item) => sum + (item.itbis || 0), 0);
  }

  /**
   * Calcula la suma total de abonos recibidos
   */
  getTotalAbonosRecibidos(): number {
    if (!this.cierreCajaResumen || !this.cierreCajaResumen.detallesPorTipoPago) {
      return 0;
    }
    return this.cierreCajaResumen.detallesPorTipoPago.reduce((sum, item) => sum + (item.cantidadAbonosRecibidos || 0), 0);
  }

  /**
   * Calcula la suma total del monto de abonos
   */
  getTotalAbonos(): number {
    if (!this.cierreCajaResumen || !this.cierreCajaResumen.detallesPorTipoPago) {
      return 0;
    }
    return this.cierreCajaResumen.detallesPorTipoPago.reduce((sum, item) => sum + (item.montoAbonos || 0), 0);
  }

  /**
   * Retorna los detalles que son de crédito
   */
  getDetallesCreditoItems(): CierreCajaDetalleReporte[] {
    if (!this.cierreCajaResumen || !this.cierreCajaResumen.detallesPorTipoPago) {
      return [];
    }
    return this.cierreCajaResumen.detallesPorTipoPago.filter(d => this.esCredito(d.tipoPago));
  }

  /**
   * Imprime el reporte de cierre de caja
   */
  imprimirReporte(): void {
    if (!this.cierreCajaResumen) {
      this.toast.warning('No hay datos para imprimir. Por favor, cargue el reporte primero.');
      return;
    }

    // Crear una ventana de impresión
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) {
      this.toast.error('No se pudo abrir la ventana de impresión. Verifique la configuración del navegador.');
      return;
    }

    printWindow.document.write('<html><head><title>Cierre de Caja</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Arial, sans-serif; margin: 20px; }');
    printWindow.document.write('.print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }');
    printWindow.document.write('.print-header img { max-width: 80px; height: auto; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; }');
    printWindow.document.write('.print-header h2 { margin: 5px 0; }');
    printWindow.document.write('.print-header p { margin: 3px 0; font-size: 0.95em; }');
    printWindow.document.write('.print-section { margin-bottom: 20px; }');
    printWindow.document.write('.summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }');
    printWindow.document.write('.summary-card { border: 1px solid #ccc; padding: 10px; border-radius: 5px; }');
    printWindow.document.write('.summary-card-label { font-size: 0.8em; color: #666; margin-bottom: 5px; }');
    printWindow.document.write('.summary-card-value { font-size: 1.2em; font-weight: bold; }');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }');
    printWindow.document.write('th { background-color: #f5f5f5; border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold; font-size: 0.85em; }');
    printWindow.document.write('td { border: 1px solid #ddd; padding: 8px; font-size: 0.85em; }');
    printWindow.document.write('tfoot { background-color: #f9f9f9; font-weight: bold; }');
    printWindow.document.write('.text-end { text-align: right; }');
    printWindow.document.write('.text-center { text-align: center; }');
    printWindow.document.write('th:last-child { width: 60px; }');
    printWindow.document.write('.print-footer { margin-top: 20px; text-align: center; color: #666; font-size: 0.9em; }');
    printWindow.document.write('@media print { body { margin: 0; } }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');

    // Header del reporte
    printWindow.document.write('<div class="print-header">');

    // Logo de la empresa - cargar con fetch para convertir a base64
    if (this.cierreCajaResumen.datosEmpresaFactura && this.cierreCajaResumen.datosEmpresaFactura.LogoEmpresa) {
      const logoUrl = this.cierreCajaResumen.datosEmpresaFactura.LogoEmpresa;
      this.cargarImagenComoBase64(logoUrl).then((base64Data: string) => {
        // Insertar la imagen con base64
        const imgElement = '<img src="' + base64Data + '" alt="Logo">';
        const headerElement = printWindow.document.querySelector('.print-header');
        if (headerElement) {
          headerElement.insertAdjacentHTML('afterbegin', imgElement);
        }
      }).catch((err) => {
        console.log('No se pudo cargar el logo:', err);
        // Continuar sin logo
      });
    }

    // Nombre de la empresa
    if (this.cierreCajaResumen.datosEmpresaFactura) {
      printWindow.document.write('<h2>' + this.cierreCajaResumen.datosEmpresaFactura.NombreEmpresa + '</h2>');
    }

    // Nombre de la sucursal
    if (this.cierreCajaResumen.almacen) {
      printWindow.document.write('<p><strong>Sucursal: ' + this.cierreCajaResumen.almacen + '</strong></p>');
    }

    printWindow.document.write('<p>Período: ' + new Date(this.cierreCajaResumen.fechaInicio).toLocaleDateString('es-DO') + ' al ' + new Date(this.cierreCajaResumen.fechaFinal).toLocaleDateString('es-DO') + '</p>');
    printWindow.document.write('</div>');

    // Resumen de totales
    printWindow.document.write('<div class="summary-cards">');
    printWindow.document.write('<div class="summary-card"><div class="summary-card-label">Total Facturas</div><div class="summary-card-value">' + this.cierreCajaResumen.cantidadTotalFacturas + '</div></div>');
    printWindow.document.write('<div class="summary-card"><div class="summary-card-label">Efectivo Real</div><div class="summary-card-value">' + this.formatearMoneda(this.cierreCajaResumen.totalEfectivoReal) + '</div></div>');
    printWindow.document.write('<div class="summary-card"><div class="summary-card-label">Total Facturado</div><div class="summary-card-value">' + this.formatearMoneda(this.cierreCajaResumen.totalFacturado) + '</div></div>');
    printWindow.document.write('<div class="summary-card"><div class="summary-card-label">Pendiente</div><div class="summary-card-value">' + this.formatearMoneda(this.cierreCajaResumen.totalSaldoPendiente) + '</div></div>');
    printWindow.document.write('</div>');

    // Tabla de detalles
    printWindow.document.write('<div class="print-section">');
    printWindow.document.write('<table>');
    printWindow.document.write('<thead><tr>');
    printWindow.document.write('<th>Forma de Pago</th>');
    printWindow.document.write('<th class="text-center"># Facturas</th>');
    printWindow.document.write('<th class="text-end">Abonos</th>');
    printWindow.document.write('<th class="text-end">Subtotal</th>');
    printWindow.document.write('<th class="text-end">Descuento</th>');
    printWindow.document.write('<th class="text-end">ITBIS</th>');
    printWindow.document.write('<th class="text-end">Total Facturado</th>');
    printWindow.document.write('<th class="text-end">Efectivo Real</th>');
    printWindow.document.write('<th class="text-end">Pendiente</th>');
    printWindow.document.write('<th class="text-center">%</th>');
    printWindow.document.write('</tr></thead>');
    printWindow.document.write('<tbody>');

    // Detalles por tipo de pago
    this.cierreCajaResumen.detallesPorTipoPago.forEach(detalle => {
      printWindow.document.write('<tr>');
      printWindow.document.write('<td>' + detalle.tipoPago + '</td>');
      printWindow.document.write('<td class="text-center">' + detalle.cantidadFacturas + '</td>');
      printWindow.document.write('<td class="text-end">' + this.formatearMoneda(detalle.montoAbonos) + '</td>');
      printWindow.document.write('<td class="text-end">' + this.formatearMoneda(detalle.subTotal) + '</td>');
      printWindow.document.write('<td class="text-end">' + this.formatearMoneda(detalle.descuento) + '</td>');
      printWindow.document.write('<td class="text-end">' + this.formatearMoneda(detalle.itbis) + '</td>');
      printWindow.document.write('<td class="text-end">' + this.formatearMoneda(detalle.totalFacturado) + '</td>');
      printWindow.document.write('<td class="text-end">' + this.formatearMoneda(detalle.efectivoReal) + '</td>');
      if (this.esCredito(detalle.tipoPago)) {
        printWindow.document.write('<td class="text-end">' + this.formatearMoneda(detalle.saldoPendiente) + '</td>');
      } else {
        printWindow.document.write('<td class="text-end">RD$ 0.00</td>');
      }
      printWindow.document.write('<td class="text-center">' + (Math.round(detalle.porcentajeDelTotal * 100) / 100).toFixed(2) + '%</td>');
      printWindow.document.write('</tr>');
    });

    // Totales finales
    printWindow.document.write('<tr style="border-top: 2px solid #333;">');
    printWindow.document.write('<td><strong>TOTALES</strong></td>');
    printWindow.document.write('<td class="text-center"><strong>' + this.cierreCajaResumen.cantidadTotalFacturas + '</strong></td>');
    printWindow.document.write('<td class="text-end"><strong>' + this.formatearMoneda(this.getTotalAbonos()) + '</strong></td>');
    printWindow.document.write('<td class="text-end"><strong>' + this.formatearMoneda(this.getTotalSubtotal()) + '</strong></td>');
    printWindow.document.write('<td class="text-end"><strong>' + this.formatearMoneda(this.getTotalDescuentos()) + '</strong></td>');
    printWindow.document.write('<td class="text-end"><strong>' + this.formatearMoneda(this.getTotalITBIS()) + '</strong></td>');
    printWindow.document.write('<td class="text-end"><strong>' + this.formatearMoneda(this.cierreCajaResumen.totalFacturado) + '</strong></td>');
    printWindow.document.write('<td class="text-end"><strong>' + this.formatearMoneda(this.cierreCajaResumen.totalEfectivoReal) + '</strong></td>');
    printWindow.document.write('<td class="text-end"><strong>' + this.formatearMoneda(this.cierreCajaResumen.totalSaldoPendiente) + '</strong></td>');
    printWindow.document.write('<td class="text-center"><strong>100%</strong></td>');
    printWindow.document.write('</tr>');
    printWindow.document.write('</tbody>');
    printWindow.document.write('</table>');
    printWindow.document.write('</div>');

    // Footer
    printWindow.document.write('<div class="print-footer">');
    printWindow.document.write('<p>Impreso el: ' + new Date().toLocaleString('es-DO') + '</p>');
    printWindow.document.write('</div>');

    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // Imprimir directamente sin esperar
    printWindow.print();
    
    // Cerrar la ventana después de imprimir
    printWindow.addEventListener('afterprint', () => {
      printWindow.close();
    });
    
    // Fallback para navegadores que no disparan afterprint
    setTimeout(() => {
      try {
        if (printWindow && !printWindow.closed) {
          printWindow.close();
        }
      } catch (e) {
        // Ignorar errores si la ventana ya fue cerrada
      }
    }, 1000);
  }

  /**
   * Convierte una imagen de URL a base64 para embedirla en el PDF
   */
  private cargarImagenComoBase64(url: string): Promise<string> {
    return fetch(url)
      .then(response => response.blob())
      .then(blob => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      });
  }
}
