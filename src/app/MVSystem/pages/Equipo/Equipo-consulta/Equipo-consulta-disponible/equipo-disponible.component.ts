import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { forkJoin, Subscription } from 'rxjs';

declare var JsBarcode: any;

import {
  Almacen,
  ModeloEquipo,
  Suplidor,
} from 'src/app/core/interfaces/catalogo.interface';
import { EquipoDisponible } from 'src/app/core/interfaces/equipo.interface';
import { VendedorLista } from 'src/app/core/interfaces/vendedor.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { EquipoService } from 'src/app/core/services/equipo.service';
import { ToastrService } from 'ngx-toastr';
import { CreatorPDFFile } from 'src/app/helpers/helper';
import { LoginService } from 'src/app/auth/login.service';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';
import { UserTrackingService } from 'src/app/core/services/user-tracking.service';

@Component({
  selector: 'app-equipo-disponible',
  templateUrl: './equipo-disponible.component.html',
  styleUrls: ['./equipo-disponible.component.css'],
})
export class EquipoDisponibleComponent implements OnInit, OnDestroy, OnChanges {
  constructor(
    private loading: LoadingService,
    private fb: FormBuilder,
    private equipoService: EquipoService,
    private catalogosService: CatalogosService,
    private toast: ToastrService,
    private loginService: LoginService,
    private validatorPermissionService:ValidatorPermissionService,
    private tracking: UserTrackingService
  ) { }



  SelectSucursal(): boolean {
    return this.validatorPermissionService.validateUserRole("CB_SUCURSAL");
  }

  // Este método se llama cuando cambia el número de elementos por página
  onPageSizeChange() {
     console.log("total registros",this.totalRecord);
   //  debugger;
    // Si se selecciona "Todos", mostramos todos los registros
    if (this.filter.pageSize === this.totalRecord) {
      this.filter.pageIndex = 1;  // Restablecer a la primera página
    } else {
      this.filter.pageIndex = 1;  // Siempre resetear a página 1 cuando cambia el tamaño
    }
    this.currentPage = 1;
    this.obtenerEquiposDisponibles(false);  // Rehacer la consulta para actualizar los datos (sin resetear página porque ya lo hicimos)
  }

  ngOnInit(): void {
    //this.loading.showLoading();
    this.obtenerEquiposDisponibles();
    this.loadCatalogos();
//this.loading.hideLoading();

    // 📊 Tracking: Registro de acceso al módulo
    this.tracking.trackPageView('MNU_CONS_EQUIPOS', 'PageView').subscribe();
  }
  ngOnChanges(changes: SimpleChanges): void {
    const change = changes["clearFilter"];
    if (change && change.previousValue != change.currentValue) {
      this.clearFilters();
    }

  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  @Input() clearFilter: any;
  subscription!: Subscription;
  printing: boolean = false;
  rangeDatePlaceholder: Date = new Date();
  equipoQuantity:  number = 0;
  totalInventario: number = 0;
  currentPage:     number = 1;
  totalRecord!:    number;
  line!:           number;
  lastLine!:       number;
  almacenListado: Almacen[] = [];
  modeloListado:  ModeloEquipo[] = [];
  listaVendedor:  VendedorLista[] = [];
  listaSuplidor:  Suplidor[] = [];
  equiposDisponibles: EquipoDisponible[] = [];
  isLoading: boolean = false; // Variable para controlar el estado de carga


  filter: any = {
    almacen: 0,
    modelo: 0,
    imei: '',
    suplidor: '',
    pageIndex: 1,
    pageSize: 10,
    fechaInicio: '',
    fechaFinal: '',
    Empresa:this.loginService.getUserEmpresa,
    IdEmpresa:this.loginService.getUserIdEmpresa,
    IdSucursal:this.loginService.getUserIdSucursal,
  };
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };
  form: FormGroup = this.fb.group({
    almacen: [''],
    suplidor: [''],
    imei: [''],
    modelo: [0,],
    rangeDate: [''],
    totalEquipos: [0,],
    totalInventario: [0,]
  });
  clearFilters() {
   // this.loading.showLoading();
    this.form.reset();
    this.filter.imei = '';
    this.filter.fechaInicio = '';
    this.filter.fechaFinal = '';
    this.obtenerEquiposDisponibles()
    //this.loading.hideLoading();
  }
  obtenerTotalEquipos(cantidadEquipo: number) {
    this.equipoQuantity = cantidadEquipo;
  }
  obtenerTotalInventario(totalInventario: number) {
    this.totalInventario = totalInventario;
  }
  onFilterPropHasValue(){

    if(
    this.filter.imei !=="" ||
    this.filter.fechaInicio !="" ||
    this.filter.fechaFinal !==""||
    this.filter.almacen  !==""||
    this.filter.modelo !== 0 ||
    this.filter.suplidor !==""){

      this.filter.pageIndex = 1;
    }

  }

onEnterKey(event: Event) {
  const keyboardEvent = event as KeyboardEvent;
  keyboardEvent.preventDefault();
  this.obtenerEquiposDisponibles();
}

obtenerEquiposDisponibles(resetPage: boolean = true) {
  this.loading.showLoading();
  this.isLoading = true;

  this.getValueFilterForm();

  // Solo resetear a página 1 si se especifica (al cambiar filtros)
  if (resetPage) {
    this.onFilterPropHasValue();
  }

  if (this.subscription) {
    this.subscription.unsubscribe();
  }



  this.subscription = this.equipoService
    .getEquipoDisponible(this.filter)
    .subscribe((equipo) => {
      const [primerRegistro] = equipo;
      const record = primerRegistro?.totalRecord || 0;
      const totalInventario = primerRegistro?.totalInventario || 0;

      this.obtenerTotalEquipos(record);
      this.obtenerTotalInventario(totalInventario);
      this.loading.hideLoading();
      this.isLoading = false;

      if (primerRegistro) {
        this.totalRecord = primerRegistro.totalRecord;
        this.line = primerRegistro.line;
        this.lastLine = primerRegistro.lastLine;
      }

      this.equiposDisponibles = equipo;
    });
}
  printReportEquipoDisponibles() {
    this.loading.showLoading();
    this.printing = true;

    this.equipoService.postEquipoDisponible(this.filter)
      .subscribe((blobResp) => {
        CreatorPDFFile(blobResp);
        this.loading.hideLoading();
        this.printing = false;
      }, (err) => {
        this.toast.error('Error al imprimir reporte', 'Error');
        this.loading.hideLoading();
        this.printing = false;
    });
  }

  /**
   * Comparte el reporte de equipos disponibles usando la API nativa de compartir del navegador
   * Para dispositivos móviles: permite compartir por WhatsApp, Email, etc.
   */
  compartirReporteEquipos() {
    // Verificar si el navegador soporta la Web Share API
    if (!navigator.share) {
      this.toast.warning('Tu navegador no soporta la función de compartir. Por favor, usa un navegador moderno en tu dispositivo móvil.');
      return;
    }

    // Mostrar loading
    this.loading.showLoading();
    this.printing = true;

    // Generar el PDF usando el mismo endpoint que la impresión normal
    this.equipoService.postEquipoDisponible(this.filter)
      .subscribe({
        next: async (blob) => {
          try {
            // Convertir el Blob a File (necesario para navigator.share)
            const fileName = `Reporte_Equipos_Disponibles_${new Date().toISOString().split('T')[0]}.pdf`;
            const file = new File([blob], fileName, { type: 'application/pdf' });

            // Intentar compartir el archivo
            try {
              await navigator.share({
                title: 'Reporte de Equipos Disponibles',
                text: 'Reporte de Equipos Disponibles - MVSystem',
                files: [file]
              } as any); // usar 'as any' para evitar error de tipos en TS

              this.toast.success('Reporte compartido exitosamente');
            } catch (shareError: any) {
              // Si falla el share con archivos, intentar solo descargar
              if (shareError.name === 'NotAllowedError' || shareError.message?.includes('files')) {
                this.toast.warning('No se puede compartir el archivo. Se descargará en su lugar.');
                CreatorPDFFile(blob);
              } else if (shareError.name !== 'AbortError') {
                // Cualquier otro error que no sea cancelación del usuario
                console.error('Error al compartir:', shareError);
                this.toast.warning('Error al compartir. Descargando archivo...');
                CreatorPDFFile(blob);
              }
              // Si es AbortError (usuario canceló), no hacer nada
            }
          } catch (error) {
            console.error('Error al procesar el archivo:', error);
            this.toast.error('Error al procesar el archivo para compartir');
            CreatorPDFFile(blob); // Fallback a descarga normal
          } finally {
            this.loading.hideLoading();
            this.printing = false;
          }
        },
        error: (err) => {
          console.error('Error al generar reporte:', err);
          this.toast.error('Error al generar reporte', 'Error');
          this.loading.hideLoading();
          this.printing = false;
        }
      });
  }

  /**
   * Copia el IMEI al portapapeles
   * @param imei - IMEI a copiar
   */
  /**
   * Genera una etiqueta/label imprimible para un equipo con código de barras
   * Optimizado para impresoras térmicas de etiquetas 50mm x 30mm
   * @param equipo - Datos del equipo para generar el label
   */
  generarLabelEquipo(equipo: EquipoDisponible) {
    const empresaNombre = this.loginService.getUserEmpresa || 'MV System';
    const fechaRegistro = new Date(equipo.fecharegistro).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    // Generar el SVG del código de barras usando jsbarcode
    let barcodeSVG = '';
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, equipo.imei, {
        format: 'CODE128',
        width: 2,
        height: 60,
        displayValue: false,
        margin: 5
      });
      barcodeSVG = canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error generando código de barras:', error);
      barcodeSVG = ''; // Si falla, continuar sin código de barras
    }

    // Determinar qué precio mostrar (Detalle si existe, sino Mayor)
    const precioMostrar = equipo.precioDetalle > 0 ? equipo.precioDetalle : equipo.precioPorMayor;
    const tipoPrecio = equipo.precioDetalle > 0 ? 'P. Detalle' : 'P. Mayor';

    const labelHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Etiqueta Equipo - ${equipo.imei}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          html {
            font-size: 16px;
          }

          body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f5f5f5;
            padding: 10px;
            margin: 0;
          }

          /* Contenedor principal - 50mm x 30mm */
          .label-container {
            width: 190px;
            height: 113px;
            background: white;
            border: 1px solid #333;
            padding: 6px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            page-break-inside: avoid;
          }

          .label-header {
            text-align: center;
            border-bottom: 1px solid #333;
            padding-bottom: 4px;
            margin-bottom: 4px;
          }

          .empresa-nombre {
            font-size: 10px;
            font-weight: bold;
            color: #333;
            line-height: 1.1;
            margin: 0;
          }

          .barcode-section {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 4px 0;
            flex-grow: 1;
          }

          .barcode-section img {
            max-width: 100%;
            height: auto;
            max-height: 55px;
          }

          .barcode-value {
            font-size: 8px;
            font-weight: bold;
            color: #333;
            font-family: 'Courier New', monospace;
            text-align: center;
            letter-spacing: 1px;
            margin-top: 2px;
            word-break: break-all;
            line-height: 1;
          }

          .label-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #333;
            padding-top: 2px;
            font-size: 8px;
            gap: 4px;
          }

          .footer-item {
            flex: 1;
            text-align: center;
            line-height: 1.1;
          }

          .footer-label {
            font-size: 7px;
            color: #666;
            text-transform: uppercase;
          }

          .footer-value {
            font-size: 8px;
            font-weight: bold;
            color: #333;
          }

          .print-instructions {
            position: fixed;
            top: 20px;
            right: 20px;
            font-size: 12px;
            color: #666;
            background-color: #fffbea;
            padding: 10px 15px;
            border-radius: 4px;
            border: 1px solid #ffeb99;
          }

          @media print {
            body {
              background: white;
              padding: 0;
              margin: 0;
              min-height: auto;
              display: block;
            }

            .print-instructions {
              display: none;
            }

            .label-container {
              box-shadow: none;
              margin: 0;
              page-break-after: always;
            }
          }

          /* Para múltiples etiquetas en una hoja */
          .labels-sheet {
            display: grid;
            grid-template-columns: repeat(auto-fill, 190px);
            gap: 10px;
            padding: 10px;
            background: #f5f5f5;
          }
        </style>
      </head>
      <body>
        <div class="print-instructions">
          <strong>Instrucciones:</strong><br>
          Usa Ctrl+P o Cmd+P para imprimir<br>
          Márgenes: 0mm<br>
          Tamaño: 50mm x 30mm
        </div>

        <div class="label-container">
          <div class="label-header">
            <p class="empresa-nombre">${empresaNombre}</p>
          </div>

          <div class="barcode-section">
            ${barcodeSVG ? `
              <img src="${barcodeSVG}" alt="Código de barras del IMEI">
              <div class="barcode-value">${equipo.imei}</div>
            ` : `
              <div class="barcode-value">${equipo.imei}</div>
            `}
          </div>

          <div class="label-footer">
            <div class="footer-item">
              <div class="footer-label">Modelo</div>
              <div class="footer-value" style="font-size: 7px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${equipo.descripcion.substring(0, 15)}</div>
            </div>

            <div class="footer-item">
              <div class="footer-label">Precio</div>
              <div class="footer-value">RD\$ ${precioMostrar.toFixed(0)}</div>
            </div>

            <div class="footer-item">
              <div class="footer-label">Fecha</div>
              <div class="footer-value">${fechaRegistro}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=600,height=400');
    if (printWindow) {
      printWindow.document.write(labelHTML);
      printWindow.document.close();
      printWindow.focus();
      // Esperar a que se cargue el contenido antes de preparar para imprimir
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } else {
      this.toast.error('No se pudo abrir la ventana de impresión. Verifica los permisos del navegador.');
    }
  }

  copiarIMEI(imei: string, event?: Event) {
    if (!imei) {
      this.toast.warning('No hay IMEI para copiar');
      return;
    }

    // Obtener el botón que disparó el evento para agregar efecto visual
    const button = event?.target as HTMLElement;
    const copyButton = button?.closest('.btn-copy-inline') as HTMLElement;

    if (navigator.clipboard && window.isSecureContext) {
      // Usar la API moderna del portapapeles
      navigator.clipboard.writeText(imei).then(() => {
        this.toast.success(`IMEI copiado: ${imei}`);
        this.activarEfectoCopia(copyButton);
      }).catch(err => {
        console.error('Error al copiar:', err);
        this.fallbackCopyText(imei, copyButton);
      });
    } else {
      // Fallback para navegadores más antiguos
      this.fallbackCopyText(imei, copyButton);
    }
  }

  /**
   * Activa el efecto visual de copiado
   * @param button - Elemento del botón
   */
  private activarEfectoCopia(button: HTMLElement | null) {
    if (button) {
      button.classList.add('copied');
      setTimeout(() => {
        button.classList.remove('copied');
      }, 600); // Duración de la animación
    }
  }

  /**
   * Método de respaldo para copiar texto
   * @param text - Texto a copiar
   * @param button - Botón para aplicar efecto
   */
  private fallbackCopyText(text: string, button?: HTMLElement) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      this.toast.success(`IMEI copiado: ${text}`);
      this.activarEfectoCopia(button || null);
    } catch (err) {
      console.error('Error al copiar:', err);
      this.toast.error('No se pudo copiar el IMEI');
    } finally {
      document.body.removeChild(textArea);
    }
  }

  getValueFilterForm() {

    let almacenValue;
    if(this.form.get('almacen')?.value !="")
  {
     almacenValue =this.form.get('almacen')?.value;
  }
  else
  {
     almacenValue =this.loginService.getUserIdSucursal; //this.form.get('almacen')?.value;
  }
  //let  almacenValue =this.form.get('almacen')?.value;
    let suplidorValue =this.form.get('suplidor')?.value;
    let modeloValue = this.form.get('modelo')?.value;
    let imei = this.form.get('imei')?.value;

    this.filter.almacen = almacenValue == null ? 0 : almacenValue;
    this.filter.suplidor = suplidorValue == null ? '' : suplidorValue;
    this.filter.modelo = modeloValue == null ? 0 : modeloValue;
    this.filter.imei = imei == null ? '' : imei;
  }
  setDateRange(): void {
    let date = new Date();
    this.form.patchValue({
      rangoFecha: {
        beginDate: {
          day: date.getDate(),
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        },
        endDate: {
          day: date.getDate(),
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        },
      },
    });
  }
  onDateRangeChanged(event: any) {
    if (event.beginDate.year === 0) {
      this.filter.fechaInicio = '';
      this.filter.fechaFinal = '';
    } else {
      this.filter.fechaInicio = `${event.beginDate.month}/${event.beginDate.day}/${event.beginDate.year}`;
      this.filter.fechaFinal = `${event.endDate.month}/${event.endDate.day}/${event.endDate.year}`;
    }

    this.obtenerEquiposDisponibles();
  }
  pageChanged(index: number) {
    this.currentPage = index;
    this.filter.pageIndex = index;
    this.obtenerEquiposDisponibles(false); // false = no resetear página
  }

  loadCatalogos(){
    this.loading.showLoading();
    forkJoin([
      this.catalogosService.getSucursales(),
      //this.catalogosService.getAlmaceLista(),
      this.catalogosService.getModeloLista(),
      this.catalogosService.getSuplidorLista(),
    ]).subscribe(resp =>{
      this.almacenListado = resp[0];
      this.modeloListado = resp[1];
      this.listaSuplidor = resp[2];


    })
    this.loading.hideLoading();
  }
}
