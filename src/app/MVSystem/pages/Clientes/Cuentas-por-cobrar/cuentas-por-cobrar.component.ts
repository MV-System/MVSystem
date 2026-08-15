// ...existing code...
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/auth/login.service';
import { AbonoFacturaParam, AbonoFacturaResponse, ClientesConFacturasPendientesRetorn, FacturasPorClienteRetorn, Cliente } from 'src/app/core/interfaces/cliente.interface';
import { ClientesService } from 'src/app/core/services/clientes.service';
import { RDialogService } from 'src/app/shared/components/r-dialog/r-dialog.service';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';

import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { FacturaFilter } from 'src/app/core/interfaces/mantenimiento';
import { UserTrackingService } from 'src/app/core/services/user-tracking.service';
import { CreatorPDFFile } from 'src/app/helpers/helper';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { TipoPago } from 'src/app/core/interfaces/catalogo.interface';

@Component({
  selector: 'app-cuentas-por-cobrar',
  templateUrl: './cuentas-por-cobrar.component.html',
  styleUrls: ['./cuentas-por-cobrar.component.css']
})
export class CuentasPorCobrarComponent implements OnInit {
  idClienteSeleccionado: number = 0; // Variable para almacenar el id de la transferencia seleccionada
  NombreClienteSeleccionado: string = ''; // Variable para almacenar el id de la transferencia seleccionada
  mostrarDetalleAbonos: boolean = false; // Controla visibilidad del detalle de abonos
  CLientesPorCobrar: ClientesConFacturasPendientesRetorn[] = [];
  FacturasPorClientes: FacturasPorClienteRetorn[] = [];
  isLoading: boolean = false; // Variable para controlar el estado de carga
  editMode: boolean =  false;// Agregar la propiedad editMode aquí
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };
  AbonoValorRetorno: AbonoFacturaResponse[] = [];
  tiposPago: TipoPago[] = [];
  idTipoPagoSeleccionado: number = 0;
  notaAbono: string = '';
   // Obtener la fecha actual
 fechaHoy = new Date();
 // Crear una nueva fecha para el primer día del mes actual
FechaInicio = '';//new Date(this.fechaHoy.getFullYear(), this.fechaHoy.getMonth(), 1);

  currentPage:     number = 1;
  totalRecord!:    number;
  line!:           number;
  lastLine!:       number;
  equipoQuantity:  number = 0;
  totalInventario: number = 0;

  filter: any = {
    pageIndex: 1,
    pageSize: 10,
    fechaInicio: '',//this.FechaInicio.toISOString().split('T')[0],
    fechaFinal: this.fechaHoy.toISOString().split('T')[0],
    NombreCliente: '',
    NumeroTelefono: '',
    Empresa:this.loginService.getUserEmpresa,
    IdEmpresa:this.loginService.getUserIdEmpresa,
    IdSucursal:this.loginService.getUserIdSucursal,
  };



  form: FormGroup = this.fb.group({
    rangeDate: [''],
    criterio:['']
  });

   filterParam: AbonoFacturaParam = {
    Id_Cliente:0,
    NumeroFactura:0,
    MontoAbono: 0,
    IdTipoPago: 0,
    Nota: '',
    IdSucursal:+this.loginService.getUserIdSucursal,
    Usuario: this.loginService.getUserName()
  };
  totalMontoPendiente: number =0;
  isProcesandoAbono: boolean = false;
  idLoteAbonoActual: string = '';

  constructor(
    private loading: LoadingService,
    private fb: FormBuilder,
    private loginService: LoginService,
    private ClienteService: ClientesService,
    private toastr: ToastrService,
    private rDialogService: RDialogService,
    private mantenimientoService: MantenimientoService,
    private tracking: UserTrackingService,
    private catalogosService: CatalogosService
  ) { }
  /**
   * Compartir factura pendiente (solo móvil) usando Web Share API
   */
  async compartirFactura(detalle: any) {
    const numeroFactura = detalle.numeroFactura;
    if (!numeroFactura || numeroFactura <= 0) {
      this.toastr.error('Número de factura inválido');
      return;
    }

    if (!navigator.share) {
      this.toastr.warning('Tu navegador no soporta la función de compartir. Usa un navegador moderno en tu dispositivo móvil.');
      return;
    }

    this.loading.showLoading();
    this.isLoading = true;

    // Construir el filtro para el PDF (ajustar según tu lógica de negocio)
    const filter: FacturaFilter = {
      almacen:Number(this.loginService.getUserIdSucursal),// Si tienes almacén, pon el valor correcto
      criterio: '',
      empresa: this.loginService.getUserEmpresa,
      IdEmpresa: this.loginService.getUserIdEmpresa,
      IdSucursal: this.loginService.getUserIdSucursal,
      ComprobanteCheck: 1,
      EstadoFactura: 'A',
      IdVendedor: 0,
      pageIndex: 1,
      pageSize: 1,
      fechaInicio: '',
      fechaFinal: '',
      Usuario: this.loginService.getUserName(),
    };

    try {
      this.mantenimientoService.postFacturaReport(filter, numeroFactura).subscribe({
        next: async (blob: Blob) => {
          try {
            const fileName = `Factura_${numeroFactura}.pdf`;
            const file = new File([blob], fileName, { type: 'application/pdf' });
            await (navigator as any).share({
              title: `Factura #${numeroFactura}`,
              text: `Factura #${numeroFactura} - MVSystem`,
              files: [file]
            });
            this.toastr.success('Factura compartida exitosamente');
          } catch (shareError: any) {
            this.toastr.warning('No se pudo compartir la factura. Se descargará en su lugar.');
            // Descargar el archivo como fallback
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Factura_${numeroFactura}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          } finally {
            this.loading.hideLoading();
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.toastr.error('Error al generar la factura para compartir');
          this.loading.hideLoading();
          this.isLoading = false;
        }
      });
    } catch (error) {
      this.toastr.error('Error inesperado al compartir la factura');
      this.loading.hideLoading();
      this.isLoading = false;
    }
  }

  /**
   * Compartir todas las facturas pendientes de un cliente (solo móvil, varios archivos)
   */
  async compartirFacturasCliente(cliente: any) {
    const idCliente = cliente.id_Cliente;
    if (!idCliente || idCliente <= 0) {
      this.toastr.error('Cliente inválido');
      return;
    }
    // Corregido: usar (navigator as any).canShare para evitar error TS2339
    if (!navigator.share || !(navigator as any).canShare || !(navigator as any).canShare({ files: [] })) {
      this.toastr.warning('Tu navegador no soporta la función de compartir múltiples archivos. Usa un navegador moderno en tu dispositivo móvil.');
      return;
    }
    if (!this.FacturasPorClientes || this.FacturasPorClientes.length === 0) {
      this.toastr.warning('No hay facturas pendientes para este cliente.');
      return;
    }
    this.loading.showLoading();
    this.isLoading = true;
    try {
      // Limitar a 10 facturas para evitar problemas de tamaño (ajusta según necesidad)
      const facturas = this.FacturasPorClientes.slice(0, 10);
      const filterBase: FacturaFilter = {
        almacen: Number(this.loginService.getUserIdSucursal),
        criterio: '',
        empresa: this.loginService.getUserEmpresa,
        IdEmpresa: this.loginService.getUserIdEmpresa,
        IdSucursal: this.loginService.getUserIdSucursal,
        ComprobanteCheck: 1,
        EstadoFactura: 'A',
        IdVendedor: 0,
        pageIndex: 1,
        pageSize: 1,
        fechaInicio: '',
        fechaFinal: '',
        Usuario: this.loginService.getUserName(),
      };
      // Descargar todos los PDFs en paralelo
      const pdfPromises = facturas.map(detalle =>
        new Promise<File>((resolve, reject) => {
          this.mantenimientoService.postFacturaReport(filterBase, detalle.numeroFactura).subscribe({
            next: (blob: Blob) => {
              const file = new File([blob], `Factura_${detalle.numeroFactura}.pdf`, { type: 'application/pdf' });
              resolve(file);
            },
            error: (err) => reject(err)
          });
        })
      );
      const files = await Promise.all(pdfPromises);
      if ((navigator as any).canShare({ files })) {
        await (navigator as any).share({
          title: `Facturas del cliente #${idCliente}`,
          text: `Facturas pendientes del cliente #${idCliente} - MVSystem`,
          files
        });
        this.toastr.success('Facturas compartidas exitosamente');
      } else {
        this.toastr.warning('No se pueden compartir estos archivos. Se descargará la primera factura.');
        // Fallback: descargar el primer archivo
        const url = window.URL.createObjectURL(files[0]);
        const a = document.createElement('a');
        a.href = url;
        a.download = files[0].name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      this.toastr.error('Error al compartir las facturas.');
    } finally {
      this.loading.hideLoading();
      this.isLoading = false;
    }
  }



  ngOnInit(): void {
    console.log('[CuentasPorCobrar] Componente inicializado');
    this.cargarTiposPago();
    this.obtenerClientes();

    // 📊 Tracking: Registro de acceso al módulo
    this.tracking.trackPageView('MNU_CONS_CUENTAS_COBRAR', 'PageView').subscribe();
  }

  private cargarTiposPago(): void {
    // Tipos de pago excluidos del abono: Credito (2) y Mixto (6).
    // No aplican para un abono, que siempre debe registrarse con un
    // medio de pago real (efectivo, transferencia, tarjeta, etc.).
    const idsTipoPagoExcluidos = [2, 6];

    this.catalogosService.getTipoPagoLista().subscribe({
      next: (tipos) => {
        this.tiposPago = (tipos || []).filter(tipo => !idsTipoPagoExcluidos.includes(tipo.iD_Tipo_Pagos));

        // No se auto-selecciona un tipo de pago por defecto: el usuario debe
        // elegir explícitamente uno para cada abono, de lo contrario la
        // validación de "seleccione un tipo de pago" queda sin efecto.
      },
      error: (error) => {
        console.error('Error al cargar tipos de pago:', error);
        this.toastr.warning('No se pudo cargar el catálogo de tipos de pago.');
      }
    });
  }

  /**
   * Detecta si la pantalla es móvil (ancho <= 600px)
   */
  isMobileScreen(): boolean {
    return window.innerWidth <= 600;
  }

  // Función para determinar si la factura está vencida
  isFacturaVencida(fechaLimite: string): boolean {
    const fechaLimiteFactura = new Date(fechaLimite);
    const fechaHoy = new Date();

    // Comparar fechas: si la fecha de vencimiento es menor a la fecha actual, es una factura vencida
    return fechaLimiteFactura < fechaHoy;
  }
  isClienteSelect(clienteId: number): boolean {
    this.idClienteSeleccionado == clienteId;
    return true;
  }
  procesarAbono(detalle: any): void {
    if (this.isProcesandoAbono) {
      return;
    }

    console.log('=== INICIO procesarAbono ===');
    console.log('Detalle:', detalle);
    console.log('filterParam antes:', this.filterParam);
    console.log('idClienteSeleccionado:', this.idClienteSeleccionado);

    if (this.filterParam.MontoAbono === 0) {

      this.filterParam.MontoAbono = detalle.montoAbono;
      this.filterParam.NumeroFactura = detalle.numeroFactura;

    }

    const idTipoPago = Number(detalle?.idTipoPago || this.idTipoPagoSeleccionado);
    const notaAbono = (detalle?.notaAbono || this.notaAbono || '').trim();

    if (!idTipoPago || idTipoPago <= 0) {
      this.toastr.info('Seleccione un tipo de pago para continuar.');
      return;
    }

    // Asegúrate de que la propiedad Usuario esté correctamente asignada
    const filterParam: AbonoFacturaParam = {
      Id_Cliente: this.idClienteSeleccionado,
      NumeroFactura: this.filterParam.NumeroFactura,
      MontoAbono: this.filterParam.MontoAbono,
      IdTipoPago: idTipoPago,
      Nota: notaAbono,
      IdSucursal: +this.loginService.getUserIdSucursal,
      Usuario: this.loginService.getUserName(),  // Aquí asignamos Usuario correctamente
    };
    const monto = this.filterParam.MontoAbono;

    if (monto > detalle.montoPendiente) {
      this.toastr.info('El abono no puede ser mayor al monto pendiente.');
      return;
    }

    if (monto) {
      this.isProcesandoAbono = true;

      // Reiniciamos de inmediato los campos del abono de esta factura
      // (antes de esperar la respuesta del servidor). Esto oculta el botón
      // "Procesar" y el panel de captura, evitando que un doble clic vuelva
      // a enviar el mismo abono mientras la petición sigue en curso.
      detalle.montoAbono = 0;
      detalle.idTipoPago = 0;
      detalle.notaAbono = '';
      detalle.showInput = false;

      this.ClienteService.postAbonoFactura(filterParam).subscribe({
        next: (response) => {
          console.log('=== ABONO FACTURA SUCCESS ===');
          console.log('Response:', response);
          this.isLoading = false;  // Terminar carga

          const mensaje = response.mensaje;  // Accediendo correctamente a 'mensaje'
          console.log('Mensaje:', mensaje);
          this.toastr.info(mensaje);

          // Guardar datos antes de limpiar
          const clienteId = filterParam.Id_Cliente;
          const facturaNum = filterParam.NumeroFactura;

          console.log('Datos guardados - clienteId:', clienteId, 'facturaNum:', facturaNum);

          // Confirmar antes de imprimir recibo
          this.confirmarImpresionRecibo(clienteId, facturaNum, false);
        },
        error: (err) => {
          console.error('=== ABONO FACTURA ERROR ===');
          console.error('Error Procesando el Abono:', err);
          this.isLoading = false;  // Terminar carga en caso de error
          this.isProcesandoAbono = false;
        },
      });
    } else {
      console.error('No se ha ingresado un monto para el abono.');
    }
  }
  procesarAbonoGeneral(Abono: any): void {
    if (this.isProcesandoAbono) {
      return;
    }

    console.log('=== INICIO procesarAbonoGeneral ===');
    console.log('Abono:', Abono);
    console.log('filterParam antes:', this.filterParam);
    console.log('idClienteSeleccionado:', this.idClienteSeleccionado);

    if (this.filterParam.MontoAbono === 0) {

      this.filterParam.MontoAbono = Abono.montoAbonoGeneral;
      this.filterParam.Id_Cliente = Abono.id_Cliente;

    }

    const idTipoPago = Number(Abono?.idTipoPago || this.idTipoPagoSeleccionado);
    const notaAbono = (Abono?.notaAbono || this.notaAbono || '').trim();

    if (!idTipoPago || idTipoPago <= 0) {
      this.toastr.info('Seleccione un tipo de pago para continuar.');
      return;
    }

    // Asegúrate de que la propiedad Usuario esté correctamente asignada
    const filterParam: AbonoFacturaParam = {
      Id_Cliente: this.filterParam.Id_Cliente,
      NumeroFactura: 0,
      MontoAbono: this.filterParam.MontoAbono,
      IdTipoPago: idTipoPago,
      Nota: notaAbono,
      IdSucursal: +this.loginService.getUserIdSucursal,
      Usuario: this.loginService.getUserName(),  // Aquí asignamos Usuario correctamente
    };
    const monto = this.filterParam.MontoAbono;

    if (monto > Abono.montoPendiente) {
      this.toastr.info('El abono no puede ser mayor al monto pendiente.');
      return;
    }

    if (monto) {
      this.isProcesandoAbono = true;

      // Reiniciamos de inmediato los campos del abono general de este
      // cliente (antes de esperar la respuesta del servidor). Esto oculta el
      // botón "Procesar" y el panel de captura, evitando que un doble clic
      // vuelva a enviar el mismo abono mientras la petición sigue en curso.
      Abono.montoAbonoGeneral = 0;
      Abono.idTipoPago = 0;
      Abono.notaAbono = '';
      Abono.showInput = false;

      this.ClienteService.postAbonoGeneral(filterParam).subscribe({
        next: (response) => {
          console.log('=== ABONO GENERAL SUCCESS ===');
          console.log('Response:', response);
          this.isLoading = false;  // Terminar carga

          const mensaje = response.mensaje;  // Accediendo correctamente a 'mensaje'
          console.log('Mensaje:', mensaje);
          this.toastr.info(mensaje);

          this.idLoteAbonoActual = response.idLoteAbono || '';

          // Guardar datos antes de limpiar
          const clienteId = filterParam.Id_Cliente;
          const facturaNum = filterParam.NumeroFactura;

          console.log('Datos guardados - clienteId:', clienteId, 'facturaNum:', facturaNum);

          // Confirmar antes de imprimir recibo
          this.confirmarImpresionRecibo(clienteId, facturaNum, true);
        },
        error: (err) => {
          console.error('=== ABONO GENERAL ERROR ===');
          console.error('Error Procesando el Abono:', err);
          this.isLoading = false;  // Terminar carga en caso de error
          console.error('Error Procesando el Abono:', err);
          this.isProcesandoAbono = false;
        },
      });
    } else {
      console.error('No se ha ingresado un monto para el abono.');
    }
  }

  // Función para reiniciar el filterParam
  resetFilterParam(): void {
    this.filterParam = {
      MontoAbono: 0,
      NumeroFactura: 0,
      IdTipoPago: this.idTipoPagoSeleccionado,
      Nota: '',
      Usuario: '', // Reestablecemos la propiedad Usuario si es necesario
      Id_Cliente: 0,
      IdSucursal: 0
      // Puedes reiniciar las demás propiedades según sea necesario
    };
    this.notaAbono = '';
    this.idLoteAbonoActual = '';
  }

  /**
   * Toggle para mostrar/ocultar el historial de abonos del cliente seleccionado
   */
  toggleDetalleAbonos(): void {
    this.mostrarDetalleAbonos = !this.mostrarDetalleAbonos;
  }

  private async extractHttpErrorDetail(error: any): Promise<string> {
    const source = error?.error;

    if (typeof source === 'string') {
      return source;
    }

    if (source instanceof Blob) {
      try {
        return await source.text();
      } catch {
        return '';
      }
    }

    if (source && typeof source === 'object') {
      return source.message || source.error || JSON.stringify(source);
    }

    return error?.message || '';
  }

  private confirmarImpresionRecibo(idCliente: number, numeroFactura: number, debeRecargar: boolean): void {
    // Capturar el lote antes de resetear el filterParam, ya que resetFilterParam
    // limpia idLoteAbonoActual y necesitamos su valor para el recibo general.
    const idLoteAbono = this.idLoteAbonoActual;

    this.idClienteSeleccionado = 0;
    this.NombreClienteSeleccionado = '';
    this.FacturasPorClientes = [];
    this.resetFilterParam();

    // Primero actualizamos el listado/montos (el abono ya fue procesado en el
    // servidor) y solo después preguntamos si desea imprimir el recibo, para
    // que el formulario ya esté al día cuando aparezca el diálogo.
    this.obtenerClientes();

    this.rDialogService.openDialog(
      'Aviso',
      'Desea imprimir el recibo de abono?',
      () => {
        this.imprimirReciboAbono(idCliente, numeroFactura, debeRecargar, idLoteAbono);
      },
      () => {
        this.isProcesandoAbono = false;
      },
      'No',
      'Si'
    );
  }

imprimirReciboAbono(idCliente: number, numeroFactura: number, debeRecargar: boolean = false, idLoteAbono: string = ''): void {
    if (!idCliente || idCliente === 0) {
      this.toastr.warning('No se puede generar recibo: cliente no válido');
      return;
    }

    const esAbonoGeneral = debeRecargar && !!idLoteAbono;

    if (esAbonoGeneral && !idLoteAbono) {
      this.toastr.warning('No se puede generar recibo: lote de abono no válido');
      return;
    }

    this.loading.showLoading();
    this.isLoading = true;

    const recibo$ = esAbonoGeneral
      ? this.ClienteService.getReciboAbonoGeneral(
          idLoteAbono,
          this.loginService.getUserIdSucursal,
          this.loginService.getUserIdEmpresa
        )
      : this.ClienteService.getReciboAbono(
          idCliente,
          numeroFactura,
          this.loginService.getUserIdSucursal,
          this.loginService.getUserIdEmpresa
        );

    recibo$.subscribe({
      next: (blob) => {
        if (!blob || blob.size === 0) {
          this.toastr.warning('El recibo está vacío');
          this.loading.hideLoading();
          this.isLoading = false;
          this.isProcesandoAbono = false;
          return;
        }

        try {
          if (debeRecargar) {
            const pdfBlob = new Blob([blob], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(pdfBlob);
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = blobUrl;

            let limpiezaEjecutada = false;
            const limpiarIframe = () => {
              if (limpiezaEjecutada) {
                return;
              }

              limpiezaEjecutada = true;
              URL.revokeObjectURL(blobUrl);
              if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
              }

              // Ya no se recarga la página automáticamente. Los datos
              // (montos, listado de clientes) se actualizan solo cuando
              // el usuario lo solicite con el botón "Actualizar".
              this.isProcesandoAbono = false;
            };

            iframe.onload = () => {
              const frameWindow = iframe.contentWindow;
              if (!frameWindow) {
                limpiarIframe();
                return;
              }

              frameWindow.focus();
              frameWindow.print();

              // Limpieza de recursos (iframe/blob) sin recargar la página.
              setTimeout(() => limpiarIframe(), 30000);
            };

            document.body.appendChild(iframe);
          } else {
            CreatorPDFFile(blob);
            this.isProcesandoAbono = false;
          }

          this.loading.hideLoading();
          this.isLoading = false;
        } catch (error) {
          console.error('Error al abrir recibo:', error);
          this.toastr.error('Error al abrir el recibo');
          this.loading.hideLoading();
          this.isLoading = false;
          this.isProcesandoAbono = false;
        }
      },
      error: async (error) => {
        const detail = await this.extractHttpErrorDetail(error);
        console.error('Error getReciboAbono:', error?.status, detail || error?.message);
        this.toastr.warning('No se pudo generar el recibo: ' + (detail || error?.message || 'Error desconocido'));
        this.loading.hideLoading();
        this.isLoading = false;
        this.isProcesandoAbono = false;
      }
    });
  }

  toggleDetalleInput(detalle: any, event: Event): void {
    // Evitar que la acción del clic afecte la selección de filas
    event.stopPropagation();

    // Alternar la propiedad `showInput` para mostrar/ocultar el input
    detalle.showInput = !detalle.showInput;

    // Inicializar el tipo de pago en 0 (placeholder "Tipo de pago") si aún no
    // tiene un valor. Sin esto, el objeto llega desde la API con
    // idTipoPago === undefined, lo que impide que Angular haga match con el
    // [ngValue]="0" del placeholder y el select se muestra en blanco cuando
    // está cerrado (aunque sí se ve el texto al desplegar las opciones).
    if (detalle.showInput && (detalle.idTipoPago === undefined || detalle.idTipoPago === null)) {
      detalle.idTipoPago = 0;
    }
  }

  SaldarFactura(detalle: any): void {
    this.rDialogService.openDialog(
      "Aviso",
      `Esta acción saldará la factura #${detalle.numeroFactura}. ¿Está seguro de proceder con esta acción?`,
      () => {
        this.toastr.info("No se procesa la acción."); // Acción para el botón "No"
      },
      () => {
        // Configuramos los parámetros del abono
        this.filterParam.MontoAbono = detalle.montoPendiente;
        this.filterParam.NumeroFactura = detalle.numeroFactura;

        const filterParam: AbonoFacturaParam = {
          Id_Cliente: this.idClienteSeleccionado,
          NumeroFactura: detalle.numeroFactura,
          MontoAbono: detalle.montoPendiente,
          IdTipoPago: Number(detalle?.idTipoPago || this.idTipoPagoSeleccionado),
          Nota: (detalle?.notaAbono || this.notaAbono || '').trim(),
          IdSucursal: +this.loginService.getUserIdSucursal, // Asegúrate de llamar al método con paréntesis
          Usuario: this.loginService.getUserName()
        };

        // Procesamos el abono
        this.procesarAbono(filterParam);
      },
      "Sí", // Etiqueta del botón para confirmar la acción
      "No, fue un error" // Etiqueta del botón para cancelar
    );
}

  SaldarCuentaTotal(Saldar: any): void {
    this.rDialogService.openDialog(
      "Aviso",
      `Esta acción saldará todas las facturas del cliente: ${Saldar.cliente}. ¿Está seguro de proceder con esta acción?`,
      () => {
        this.toastr.info("No se procesa la acción.");
      },
      () => {
        this.filterParam.MontoAbono = Saldar.montoPendiente;
        this.filterParam.Id_Cliente = Saldar.id_Cliente;

        const filterParam: AbonoFacturaParam = {
      Id_Cliente:this.idClienteSeleccionado,
      NumeroFactura:0,
      MontoAbono: Saldar.montoPendiente,
      IdTipoPago: Number(Saldar?.idTipoPago || this.idTipoPagoSeleccionado),
      Nota: (Saldar?.notaAbono || this.notaAbono || '').trim(),
      IdSucursal:+this.loginService.getUserIdSucursal,
      Usuario: this.loginService.getUserName()
    };
this.procesarAbonoGeneral(filterParam);
      },
      "Si", // Etiqueta del botón para Anular la factura
      "No, Fue un error" // fue un error
    );
  }
  pageChanged(index: number) {

    this.idClienteSeleccionado = 0;
    this.NombreClienteSeleccionado = '';
    this.mostrarDetalleAbonos = false;
    this.FacturasPorClientes = [];
    this.currentPage = index;
    this.filter.pageIndex = index;

    this.ClienteService.getClientesConFacturasPendientes('','','').subscribe(
      (data) => {
        if (data.length) {
        }
        this.CLientesPorCobrar = data;
      },
      (error) => {
        console.error("Error al obtener equipos disponibles:", error);
      }
    );




    //this.obtenerClientes();
  }
  seleccionarFila(cliente: ClientesConFacturasPendientesRetorn): void {
    if (this.idClienteSeleccionado === cliente.id_Cliente) {
      this.idClienteSeleccionado = 0;
      this.NombreClienteSeleccionado = '';
      this.FacturasPorClientes = [];
      this.mostrarDetalleAbonos = false;
    } else {
      this.NombreClienteSeleccionado = cliente.cliente;
      this.mostrarDetalleAbonos = false;
      this.obtenerFacturasPorCLiente(cliente.id_Cliente);
    }
  }
  onEdit(detalle: FacturasPorClienteRetorn) {
    // Guardar el valor original antes de editarlo
    detalle.montoPendiente = detalle.montoPendiente;
    console.log("Equipo Capturado",detalle.montoPendiente);
    detalle.editMode = true;
  }
  obtenerFacturasPorCLiente(idClienteSeleccionado: number) {
    this.isLoading = true; // Activamos el estado de carga antes de hacer la solicitud
this.idClienteSeleccionado = idClienteSeleccionado;
    this.ClienteService.getFacturasPendientesPorCliente(idClienteSeleccionado).subscribe(
      (Trans) => {
        this.isLoading = false; // Desactivamos el estado de carga
        this.FacturasPorClientes = Trans; // Asignamos los detalles obtenidos

      },
      (error) => {
        console.error("Error al obtener los detalles de la transferencia:", error);
        //this.showErrorNotification("Error al cargar los detalles de la transferencia.");
      }
    );

  }
  onPageSizeChange() {
    this.idClienteSeleccionado = 0;
    this.NombreClienteSeleccionado = '';
    this.mostrarDetalleAbonos = false;
    this.isLoading = true;

    // Si se selecciona "Todos", mostramos todos los registros
    if (this.filter.pageSize === this.totalRecord) {
      this.filter.pageIndex = 1;  // Restablecer a la primera página
    }

    // Reiniciar la paginación al cambiar el tamaño de página
    this.currentPage = 1;
    this.filter.pageIndex = 1;

    this.ClienteService.getClientesConFacturasPendientes('','','').subscribe(
      (data) => {
        if (data.length) {
        }
        this.CLientesPorCobrar = data;
      },
      (error) => {
        console.error("Error al obtener equipos disponibles:", error);
      }
    );


    // Rehacer la consulta para actualizar los datos
    //this.obtenerClientes();
    this.isLoading = false;
  }

  onEnter(event: KeyboardEvent) {

  if (event.key === 'Enter') {  // Verifica si la tecla presionada es 'Enter'

    const criterio = this.form.get('criterio')?.value;
    this.filter.fechaInicio =''; // Fecha en formato yyyy-mm-dd
    this.filter.fechaFinal = '';


    this.obtenerClientes();  // Llama al método para obtener los clientes
  }
}
onEnterAbono(event: KeyboardEvent, detalle: any) {
  // Verificar si la tecla presionada es Enter
  if (event.key === 'Enter' && !this.isProcesandoAbono) {
    // Llamar a la misma función que el botón de "Procesar"
    this.procesarAbono(detalle);
  }
}
onEnterAbonoGeneral(event: KeyboardEvent, detalle: any) {
  // Verificar si la tecla presionada es Enter
  if (event.key === 'Enter' && !this.isProcesandoAbono) {
    // Llamar a la misma función que el botón de "Procesar"
    this.procesarAbonoGeneral(detalle);
  }
}
onDateRangeChanged(event: any) {
  this.filter.pageIndex = 1;
  //this.idTransferenciaSeleccionada = null;
  //this.equiposDetalles = []; // Limpiar los detalles cuando se deselecciona

  if (event.beginDate.year !== 0) {
    const startDate = new Date(event.beginDate.year, event.beginDate.month - 1, event.beginDate.day);
    const endDate = new Date(event.endDate.year, event.endDate.month - 1, event.endDate.day);
    this.filter.fechaInicio = startDate.toISOString().split('T')[0]; // Fecha en formato yyyy-mm-dd
    this.filter.fechaFinal = endDate.toISOString().split('T')[0];
  } else {
    this.filter.fechaInicio = '';
    this.filter.fechaFinal = '';
  }

  this.obtenerClientes();
}



obtenerClientes() {
  this.idClienteSeleccionado = 0;
  this.NombreClienteSeleccionado = '';
  this.mostrarDetalleAbonos = false;
  this.CLientesPorCobrar = []; // Limpiar los detalles cuando se deselecciona
  this.loading.showLoading();  // Mostrar el cargando

  const fechaInicio = this.filter.fechaInicio;
  const fechaFinal = this.filter.fechaFinal;
  const criterio = this.form.get('criterio')?.value;

  // Validar el criterio, evitar enviar una búsqueda vacía
  // if (!criterio) {
  //   console.log("Criterio de búsqueda vacío");
  //   this.loading.hideLoading();  // Detener el cargando si no hay criterio
  //   return;  // No hacer la solicitud si no hay criterio
  // }

  // Llamar al servicio para obtener los clientes con facturas pendientes
  this.ClienteService.getClientesConFacturasPendientes(fechaInicio, fechaFinal, criterio).subscribe(
    (data) => {
      if (data.length) {
        this.CLientesPorCobrar = data;

        // Sumar los montos pendientes de todos los clientes, asegurándose de convertir `montoPendiente` a número
        const totalMontoPendiente = this.CLientesPorCobrar.reduce((total, cliente) => {
          // Convertir montoPendiente de string a number
          const monto = parseFloat(cliente.montoPendiente);
          return total + (isNaN(monto) ? 0 : monto); // Si `monto` no es un número, agregar 0
        }, 0);

        // Aquí puedes almacenar el total en una variable para mostrarlo en un label
        this.totalMontoPendiente = totalMontoPendiente;
      } else {
        console.log("No se encontraron clientes con facturas pendientes.");
        this.CLientesPorCobrar = [];  // Limpiar la lista si no se encuentran datos
        this.totalMontoPendiente = 0; // Si no hay clientes, el total es 0
      }

      this.loading.hideLoading();  // Detener el cargando después de recibir los datos
    },
    (error) => {
      console.error("Error al obtener clientes con facturas pendientes:", error);
      this.loading.hideLoading();  // Detener el cargando si ocurre un error
      // Mostrar una notificación de error
      this.showErrorNotification("Error al cargar los clientes con facturas pendientes.");
    }
  );
}
  showErrorNotification(message: string) {
    // Puedes usar una librería como ngx-toastr, o tu propio componente de notificación
    this.toastr.error(message, 'Error');
  }
}

