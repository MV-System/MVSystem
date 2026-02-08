import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AccesoriosService } from 'src/app/core/services/accesorios.service';
import { Accesorio } from '../../../../../core/interfaces/accesorio.interface';
import { ToastrService } from 'ngx-toastr';

declare var JsBarcode: any;

@Component({
  selector: 'app-accesorio-list',
  templateUrl: './accesorio-list.component.html',
  styleUrls: ['./accesorio-list.component.css']
})
export class AccesorioListComponent implements OnInit, OnChanges {

  constructor(
    private accesoriosService: AccesoriosService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['accesorios']) {
      this.recalcularTotales();
    }
  }

  @Input() accesorios: Accesorio[]=[];
  @Input() pageSize!:    number;
  @Input() pageIndex!:   number;
  @Input() totalRecord!: number;
  @Input() currentPage:  number=1;
  @Input() line!:  number;
  @Input() lastLine!:  number;
  accesorio!: Accesorio;
  accesorioDetalle!: Accesorio;
  onEditButton: boolean = true;

  isOpenModal = false;
  isOpenDetalleModal = false;
  isLoading = false;
  title ="Editar accesorio"
  filter: any = {
    almacen: '',
    criterio:'',
    pageIndex: 1,
    pageSize: 10,
  };

  totalCantidad: number = 0;
  totalInventario: number = 0;
  totalFacturado: number = 0;
  totalGanancia: number = 0;
  totalItbis: number = 0;

  putAccesorio(){
    this.isOpenModal=!this.isOpenModal;

  }
  getIdAccesorio(id:number){
    this.onSelectAccesorio();
    if(id > 0){this.onEditButton =false;}

    this.accesoriosService.getAccesorioById(id)
    .subscribe(accesorio =>{
      this.accesorio = accesorio;
    });
  }
  onCancel() {
    this.isOpenModal = !this.isOpenModal;
  }
  onSelectAccesorio(){
    $('table tbody').on('click', 'tr', (e)=> {

        if ($(e.currentTarget).hasClass('selected')) {
            $(e.currentTarget).removeClass('selected');
            $(e.currentTarget).addClass('selected');

        } else {
          var tr = document.querySelector('tr.selected');
            $('tr.selected').removeClass('selected');
            $(e.currentTarget).addClass('selected');
        }
    });
  }

  /**
   * Navigate to accessory registration page
   */
  navigateToRegistro() {
    this.router.navigate(['/mvSystem/home/accesorios/registro']).then(
      (success) => {
        if (success) {
          this.toastr.success('Navegando al formulario de registro', 'Éxito');
        } else {
          this.toastr.error('No se pudo navegar a la página de registro', 'Error');
        }
      }
    );
  }

  /**
   * Edit accessory
   */
  editarAccesorio(accesorioId: number) {
    console.log('Editando accesorio:', accesorioId);
    this.getIdAccesorio(accesorioId);
    this.putAccesorio();
  }

  /**
   * View accessory details
   */
  verDetalle(accesorioId: number) {
    console.log('Viendo detalle del accesorio:', accesorioId);
    this.accesoriosService.getAccesorioById(accesorioId)
      .subscribe({
        next: (accesorio) => {
          this.accesorioDetalle = accesorio;
          // Debug: Mostrar todos los datos del accesorio en consola
          console.log('Datos completos del accesorio:', accesorio);
          console.log('Campos específicos:', {
            id: accesorio.id,
            modelo: accesorio.modelo,
            codigo: accesorio.codigo,
            codBarra: accesorio.codBarra,
            almacen: accesorio.almacen,
            disponible: accesorio.disponible,
            disponibleDetalle: accesorio.disponibleDetalle,
            descripcionAccesorio: accesorio.descripcionAccesorio,
            cantidad: accesorio.cantidad,
            costoEquipo: accesorio.costoEquipo,
            precioDetalle: accesorio.precioDetalle,
            precioPorMayor: accesorio.precioPorMayor,
            totalInventario: accesorio.totalInventario,
            totalFacturado: accesorio.totalFacturado,
            totalGanancia: accesorio.totalGanancia,
            totalItbis: accesorio.totalItbis
          });
          this.isOpenDetalleModal = true;
          this.toastr.success('Cargando detalles del accesorio', 'Éxito');
        },
        error: (error) => {
          console.error('Error al cargar detalles:', error);
          this.toastr.error('Error al cargar los detalles del accesorio', 'Error');
        }
      });
  }

  /**
   * Close detail modal
   */
  closeDetalleModal() {
    this.isOpenDetalleModal = false;
    this.accesorioDetalle = {} as Accesorio;
  }

  /**
   * Detect if the current screen is mobile
   */
  isMobileScreen(): boolean {
    return window.innerWidth <= 768;
  }

  /**
   * Helper function to check if a value is valid (not null, undefined, or empty string)
   */
  isValidValue(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  /**
   * Helper function to check if a numeric value is valid and greater than 0
   */
  isValidNumericValue(value: any): boolean {
    return this.isValidValue(value) && !isNaN(value) && value > 0;
  }

  /**
   * Helper function to format availability status
   */
  getAvailabilityStatus(disponible: any): string {
    if (disponible === 'S' || disponible === '1' || disponible === 1 || disponible === true) {
      return 'Sí';
    }
    return 'No';
  }

  /**
   * Helper function to check if availability is positive
   */
  isAvailable(disponible: any): boolean {
    return disponible === 'S' || disponible === '1' || disponible === 1 || disponible === true;
  }

  /**
   * Edit accessory from detail modal
   */
  editarAccesorioDesdeDetalle(accesorioId: number) {
    // Primero cerrar el modal de detalles
    this.closeDetalleModal();
    // Luego abrir el modal de edición con un pequeño delay para evitar conflictos
    setTimeout(() => {
      this.editarAccesorio(accesorioId);
    }, 100);
  }

  recalcularTotales() {
    this.totalCantidad = this.accesorios.reduce((sum, a) => sum + (a.cantidad || 0), 0);
    this.totalInventario = this.accesorios.reduce((sum, a) => sum + (a.totalInventario || 0), 0);
    this.totalFacturado = this.accesorios.reduce((sum, a) => sum + (a.totalFacturado || 0), 0);
    this.totalGanancia = this.accesorios.reduce((sum, a) => sum + (a.totalGanancia || 0), 0);
    this.totalItbis = this.accesorios.reduce((sum, a) => sum + (a.totalItbis || 0), 0);
  }

  /**
   * Genera una etiqueta/label imprimible para un accesorio con código de barras
   * Utiliza el código de barras del accesorio
   * @param accesorio - Datos del accesorio para generar el label
   */
  generarLabelAccesorio(accesorio: Accesorio) {
    // Validar que el accesorio tenga código de barras
    if (!accesorio.codBarra) {
      this.toastr.warning('Este accesorio no tiene código de barras', 'Aviso');
      return;
    }

    const codigoBarras = accesorio.codBarra;
    const descripcion = accesorio.descripcionAccesorio || 'Accesorio';
    const codigo = accesorio.codigo || 'N/A';
    const cantidad = accesorio.cantidad || 0;

    // Determinar qué precio mostrar (Detalle si existe, sino Mayor)
    const precioMostrar = accesorio.precioDetalle > 0 ? accesorio.precioDetalle : accesorio.precioPorMayor;

    // Generar el SVG del código de barras usando jsbarcode
    let barcodeSVG = '';
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, codigoBarras, {
        format: 'CODE128',
        width: 1.8,
        height: 50,
        displayValue: false,
        margin: 3
      });
      barcodeSVG = canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error generando código de barras:', error);
      this.toastr.error('Error al generar código de barras', 'Error');
      return;
    }

    const labelHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Etiqueta - ${codigoBarras}</title>
        <style>
          @page {
            size: 50mm 30mm;
            margin: 0;
            padding: 0;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          html, body {
            width: 50mm;
            height: 30mm;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: Arial, sans-serif;
            background: white;
            overflow: hidden;
          }

          .label-container {
            width: 50mm;
            height: 30mm;
            background: white;
            border: 0.5px solid #000;
            padding: 1.2mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            font-size: 7pt;
            line-height: 1;
          }

          .label-header {
            text-align: center;
            padding-bottom: 0.3mm;
            margin-bottom: 0.2mm;
            font-size: 6pt;
            font-weight: bold;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .barcode-section {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 0.2mm 0;
            overflow: hidden;
          }

          .barcode-section img {
            max-width: 100%;
            max-height: 8.5mm;
            width: auto;
            height: auto;
          }

          .barcode-value {
            font-size: 5.5pt;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            text-align: center;
            margin-top: 0.2mm;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: clip;
          }

          .description-section {
            text-align: center;
            padding: 0.1mm 0;
            margin: 0.1mm 0;
            font-size: 5.2pt;
            font-weight: bold;
            color: #000;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            height: 2.5mm;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 0.5px solid #000;
          }

          .label-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 5.8pt;
            gap: 0.2mm;
            height: 4.5mm;
            padding: 0.2mm 0.5mm 0 0.5mm;
          }

          .footer-item {
            flex: 1;
            text-align: center;
            line-height: 0.85;
            overflow: hidden;
            padding: 0 0.3mm;
          }

          .footer-label {
            font-size: 4.8pt;
            color: #333;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: -0.4px;
            line-height: 1;
            margin-bottom: 0.2mm;
          }

          .footer-value {
            font-size: 6pt;
            font-weight: bold;
            color: #000;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            line-height: 1;
          }

          .print-instructions {
            position: fixed;
            top: 10px;
            right: 10px;
            font-size: 11px;
            color: #333;
            background-color: #fff3cd;
            padding: 8px 12px;
            border: 1px solid #ffc107;
            border-radius: 3px;
            z-index: 1000;
          }

          @media print {
            @page {
              size: 50mm 30mm;
              margin: 0;
              padding: 0;
            }

            body {
              margin: 0;
              padding: 0;
              width: 50mm;
              height: 30mm;
              background: white;
            }

            .print-instructions {
              display: none;
            }

            .label-container {
              box-shadow: none;
              margin: 0;
              width: 50mm;
              height: 30mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-instructions">
          <strong>Impresión:</strong> Ctrl+P | Márgenes: 0mm
        </div>

        <div class="label-container">
          <div class="label-header">${descripcion.substring(0, 20)}</div>

          <div class="barcode-section">
            <img src="${barcodeSVG}" alt="Código de barras" />
            <div class="barcode-value">${codigoBarras}</div>
          </div>

          <div class="description-section">
            Código: ${codigo}
          </div>

          <div class="label-footer">
            <div class="footer-item">
              <div class="footer-label">Precio</div>
              <div class="footer-value">RD\$${precioMostrar.toFixed(2)}</div>
            </div>
            <div class="footer-item">
              <div class="footer-label">Stock</div>
              <div class="footer-value">${cantidad}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Abrir el contenido en una nueva ventana para impresión
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(labelHTML);
      printWindow.document.close();
      printWindow.focus();

      // Esperar a que se cargue completamente y luego imprimir
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } else {
      this.toastr.error('No se pudo abrir la ventana de impresión', 'Error');
    }
  }

}
