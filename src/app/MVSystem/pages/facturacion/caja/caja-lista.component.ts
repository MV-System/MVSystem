import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PreFacturasService, PreFactura } from 'src/app/core/services/prefacturas.service';
import { LoginService } from 'src/app/auth/login.service';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { CreatorPDFFile } from 'src/app/helpers/helper';
import { FacturaFilter } from 'src/app/core/interfaces/mantenimiento';
import { ToastrService } from 'ngx-toastr';
import { RDialogService } from 'src/app/shared/components/r-dialog/r-dialog.service';

@Component({
  selector: 'app-caja-lista',
  templateUrl: './caja-lista.component.html',
  styleUrls: ['./caja-lista.component.css']
})
export class CajaListaComponent implements OnInit {
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
      this.preFacturasService.listarPreFacturas({ Estado: 'Pendiente', criterio: searchTerm }).subscribe({
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
    private rDialogService: RDialogService
  ) {}

  ngOnInit(): void {
    this.cargarPreFacturas();
  }

  cargarPreFacturas(): void {
    this.loading = true;
    this.error = null;
    this.preFacturasService.listarPreFacturas({ Estado: 'Pendiente' }).subscribe({
      next: (data) => {
        this.preFacturas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar pre-facturas:', err);
        this.error = 'Error al cargar pre-facturas';
        this.loading = false;
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
        this.cargarPreFacturas();
        if (response && response.cod_Factura) {
          this.facturaNumberReporte = response.cod_Factura;
          // Mostrar el diálogo para preguntar si desea imprimir la factura
          this.rDialogService.openDialog(
            '¿Imprimir factura?',
            mensajeApi + '\n¿Desea imprimir la factura generada?',
            () => {
              // Si confirma, preguntar tipo de impresión
              this.rDialogService.openDialog(
                'Tipo de impresión',
                '¿Cómo desea imprimir la factura?',
                () => { this.printFacturaNormal(); },
                () => { this.printFacturaMini(); },
                'Mini',
                'Normal'
              );
            },
            () => {
              // Si cancela, no imprime
            },
            'No',
            'Sí'
          );
        }
      },
      error: () => {
        this.mensaje = 'Error al procesar la pre-factura.';
        this.accionEnCurso = null;
      }
    });
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
      IdVendedor: 0,
      numeroFactura: this.facturaNumberReporte!,
      pageIndex: 1,
      pageSize: 1,
      fechaInicio: '',
      fechaFinal: ''
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
    return {
      almacen: 0,
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
      fechaFinal: ''
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
}
