import { Component, Input, OnDestroy, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { Subscription } from 'rxjs';
import {
  Almacen,
  ModeloEquipo,
} from 'src/app/core/interfaces/catalogo.interface';
import { EquipoVendido } from 'src/app/core/interfaces/equipo.interface';
import { VendedorLista } from 'src/app/core/interfaces/vendedor.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { EquipoService } from 'src/app/core/services/equipo.service';
import { VendedorService } from 'src/app/core/services/vendedor.service';
import { Suplidor } from '../../../../../core/interfaces/catalogo.interface';
import { ToastrService } from 'ngx-toastr';
import { CreatorPDFFile } from 'src/app/helpers/helper';
import { LoginService } from 'src/app/auth/login.service';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';
import { UserTrackingService } from 'src/app/core/services/user-tracking.service';

interface SalesInsight {
  title: string;
  value: string;
  description: string;
  icon: string;
  iconColor: string;
}

@Component({
  selector: 'app-equipo-consulta-vendido',
  templateUrl: './equipo-consulta-vendido.component.html',
  styleUrls: ['./equipo-consulta-vendido.component.css'],
})
export class EquipoConsultaVendidoComponent implements OnInit, OnDestroy,OnChanges {

  constructor(
    private fb: FormBuilder,
    private equipoService: EquipoService,
    private catalogosService: CatalogosService,
    private vendedorService: VendedorService,
    private toast: ToastrService,
    private loginService: LoginService,
    private loading: LoadingService,
    private validatorPermissionService:ValidatorPermissionService,
    private tracking: UserTrackingService
  ) {}
  @Input() clearFilter:any;


  SelectSucursal(): boolean {
    return this.validatorPermissionService.validateUserRole("CB_SUCURSAL");
  }

  ngOnInit(): void {
    this.seleccionarMensajeAleatorioInsights();
    this.obtenerEquiposVendidos();
    this.obtenerAlmacenLista();
    this.obtenerModeloLista();
    this.obtenerVendedor();
    this.obtenerSuplidor();

    // 📊 Tracking: Registro de acceso al módulo
    this.tracking.trackPageView('equiposVendidosMenu', 'PageView').subscribe();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  // Este método se llama cuando cambia el número de elementos por página
  onPageSizeChange() {
   // Si se selecciona "Todos", mostramos todos los registros
   if (this.filter.pageSize === this.totalRecord) {
     this.filter.pageIndex = 1;  // Restablecer a la primera página
   }
   // OPTIMIZADO: Ya no hace llamada al servidor, solo repagina en el cliente
   this.aplicarPaginacionCliente();
 }

  ngOnChanges(changes: SimpleChanges): void {
    const change =  changes["clearFilter"];

    if(change && change.previousValue != change.currentValue){

      this.clearFilters();
    }

  }
  isLoading: boolean = false; // Variable para controlar el estado de carga
  isLoadingInsights: boolean = false; // Variable para controlar el estado de carga de insights
  subscription!: Subscription;
  isPrint: boolean = false;
  totalFacturado:  number = 0;
  totalGanancia:   number = 0;
  totalItbis:      number = 0;
  equipoQuantity:  number = 0;
  totalInventario: number = 0;
  currentPage:     number = 1;
  totalRecord!:    number;
  line!:           number;
  lastLine!:       number;
  almacenListado:  Almacen[] = [];
  modeloListado:   ModeloEquipo[] = [];
  listaVendedor:   VendedorLista[] = [];
  listaSuplidor:   Suplidor[] = [];
  equiposVendidos: EquipoVendido[] = [];
  equiposVendidosCompletos: EquipoVendido[] = [];  // NUEVO: Todos los equipos para insights
  salesInsights: SalesInsight[] = [];

  // Mensajes inteligentes para loading de insights
  private mensajesInsightsDisponibles = [
    {
      titulo: '🧠 Estoy analizando los patrones de venta, dame un momento...',
      subtitulo: 'Estoy identificando qué modelos y vendedores están generando más ingresos.'
    },
    {
      titulo: '🔍 Estoy revisando el rendimiento de tu equipo, no voy a tardar...',
      subtitulo: 'Estoy comparando vendedores para mostrarte quién está destacando.'
    },
    {
      titulo: '📊 Estoy calculando métricas de ventas, espera...',
      subtitulo: 'Estoy preparando información clave para optimizar tu negocio.'
    },
    {
      titulo: '💡 Voy a procesar todos los datos de ventas, dame un chance...',
      subtitulo: 'Estoy analizando cada transacción para darte insights valiosos.'
    },
    {
      titulo: '🎯 Estoy detectando los productos estrella, ya casi termino...',
      subtitulo: 'Estoy identificando cuáles equipos tienen mejor rotación y rentabilidad.'
    },
    {
      titulo: '✨ Voy a generar tu análisis personalizado, un segundo...',
      subtitulo: 'Estoy organizando las estadísticas de forma clara y accionable.'
    },
    {
      titulo: '⚙️ Estoy conectando con todo el historial de ventas, dame un momento...',
      subtitulo: 'Estoy validando cada dato para darte información 100% precisa.'
    },
    {
      titulo: '📌 Validando información de rendimiento...',
      subtitulo: 'Estoy asegurándome de que los números reflejen la realidad de tu negocio.'
    },
    {
      titulo: '🚀 Optimizando el análisis...',
      subtitulo: 'Estoy maximizando la velocidad para mostrarte los insights rápidamente.'
    }
  ];

  mensajeCargaInsights = this.mensajesInsightsDisponibles[0];

  rangeDatePlaceholder: Date =new Date()
 // Obtener la fecha actual
 fechaHoy = new Date();
 // Crear una nueva fecha para el primer día del mes actual
FechaInicio = new Date(this.fechaHoy.getFullYear(), this.fechaHoy.getMonth(), 1);

  filter: any = {
    almacen: '',
    ID_Modelo: 0,  // CAMBIADO: De modelo: '' a ID_Modelo: 0
    suplidor: '',
    vendedor: '',
    telefono:'',
    imei:'',
    pageIndex: 1,
    pageSize: 10,
    fechaInicio: '',
    fechaFinal: '',
    fechaInicioFactura: this.FechaInicio.toISOString().split('T')[0],
    fechaFinalFactura: this.fechaHoy.toISOString().split('T')[0],
    Empresa:this.loginService.getUserEmpresa,
    IdEmpresa:this.loginService.getUserIdEmpresa,
    IdSucursal:this.loginService.getUserIdSucursal,
  };
  form: FormGroup = this.fb.group({
    almacen: [''],
    suplidor: [''],
    vendedor: [''],
    modelo: ['0'],  // CAMBIADO: Valor inicial '0' para compatibilidad con ID numérico
    rangeDate: [''],
    rangeDateFactura: [''],
    telefono:[''],
    imei:['',],
  });
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };



  clearFilters(){
    this.form.reset();
    this.form.patchValue({ modelo: '0' });  // AGREGADO: Resetear modelo a '0'
    this.filter.fechaInicio = '';
    this.filter.fechaFinal = '';
    this.filter.fechaInicioFactura ='';
    this.filter.fechaFinalFactura ='';
    this.filter.ID_Modelo = 0;  // AGREGADO: Resetear ID_Modelo
    this.equiposVendidosCompletos = [];  // NUEVO: Limpiar datos completos
    this.salesInsights = [];  // NUEVO: Limpiar insights
    this.obtenerEquiposVendidos()
  }
  onDateRangeChanged(event: any) {
    if (event.beginDate.year === 0) {
      this.filter.fechaInicio = '';
      this.filter.fechaFinal = '';
    } else {
      this.filter.fechaInicio = `${event.beginDate.month}/${event.beginDate.day}/${event.beginDate.year}`;
      this.filter.fechaFinal = `${event.endDate.month}/${event.endDate.day}/${event.endDate.year}`;
    }
    this.obtenerEquiposVendidos();
  }
  onDateRangeFacturaChanged(event: any) {
    if (event.beginDate.year === 0) {
      this.filter.fechaInicioFactura = '';
      this.filter.fechaFinalFactura = '';
    } else {
      // Formatear en formato ISO (YYYY-MM-DD) para consistencia
      const fechaInicio = new Date(event.beginDate.year, event.beginDate.month - 1, event.beginDate.day);
      const fechaFinal = new Date(event.endDate.year, event.endDate.month - 1, event.endDate.day);

      this.filter.fechaInicioFactura = fechaInicio.toISOString().split('T')[0];
      this.filter.fechaFinalFactura = fechaFinal.toISOString().split('T')[0];
    }
    this.obtenerEquiposVendidos();
  }
  pageChanged(index: number) {
    this.currentPage = index;
    this.filter.PageIndex = index;
    this.filter.pageIndex = index;
    // OPTIMIZADO: Ya no hace llamada al servidor, solo repagina en el cliente
    this.aplicarPaginacionCliente();
  }
  getValueFilterForm() {
  const nullOrEmpty =(data: null)=>{return data== null ? '':data}
    const {
      almacen,
      suplidor,
      vendedor,
      modelo,
      fechaRegistro,
      telefono,
      imei
    } = this.form.value;
    this.filter.fechaRegistro = nullOrEmpty(fechaRegistro);
    this.filter.almacen = nullOrEmpty(almacen);
    this.filter.vendedor = nullOrEmpty(vendedor);
    this.filter.suplidor = nullOrEmpty(suplidor);
    this.filter.ID_Modelo = modelo && modelo !== '0' ? parseInt(modelo) : 0;  // MEJORADO: Manejar tanto string "0" como valores vacíos
    this.filter.telefono = nullOrEmpty(telefono);
    this.filter.imei = nullOrEmpty(imei);

    let almacenValue;
    if(this.form.get('almacen')?.value !="")
  {
     this.filter.almacen =this.form.get('almacen')?.value;
  }
  else
  {
     this.filter.almacen =this.loginService.getUserIdSucursal; //this.form.get('almacen')?.value;
  }

  }
  onSearchByTelefono(){
    let telefonoFormValue = this.form.controls.telefono.value;
    if(telefonoFormValue.length == 10){
      this.obtenerEquiposVendidos();
    }
    else if(telefonoFormValue.length <= 0){
      this.obtenerEquiposVendidos();
    }
  }
  obtenerTotalEquipos(cantidadEquipo: number){
    // this.equipoQuantity = interval(10).pipe(take(cantidadEquipo + 1));
    this.equipoQuantity = cantidadEquipo;
  }
  obtenerTotalFacturado(totalFacturado: number){
    this.totalFacturado =totalFacturado;
  }
  obtenerTotalGanancia(totalGanancia: number){
    this.totalGanancia =totalGanancia;
  }
  obtenerTotalItbis(totalItbis: number){
    this.totalItbis =totalItbis;
  }
  obtenerTotalInventario(totalInventario: number){
    this.totalInventario =totalInventario;
  }
  onFilterPropHasValue(){
    if(
    this.filter.imei !=="" ||
    this.filter.almacen  !==""||
    this.filter.modelo !==""||
    this.filter.suplidor !=="" ||
    this.filter.vendedor !=="" ||
    this.filter.telefono !=="" ||
    this.filter.fechaInicio !="" ||
    this.filter.fechaFinal !==""||
    this.filter.fechaInicioFactura !==""||
    this.filter.fechaFinalFactura !==""
    ){

    }

  }

  obtenerEquiposVendidos() {
    this.isLoading = true;
    this.isLoadingInsights = true;
    this.getValueFilterForm();
    this.onFilterPropHasValue();

    // OPTIMIZADO: Una sola llamada al servidor para obtener TODOS los datos
    // Guardamos los filtros originales
    const filtroCompleto = {
      ...this.filter,
      pageIndex: 1,
      pageSize: 999999 // Traer todos los datos de una vez
    };

    console.log("Filtros optimizados (una sola llamada):", filtroCompleto);

    this.subscription = this.equipoService
      .getEquipoVendidoParaInsights(filtroCompleto)
      .subscribe({
        next: (equiposCompletos) => {
          console.log("Equipos recibidos (consulta única):", equiposCompletos.length);

          // Guardar todos los equipos
          this.equiposVendidosCompletos = equiposCompletos;

          // Calcular totales
          if (equiposCompletos.length > 0) {
            this.totalRecord = equiposCompletos.length;
            this.obtenerTotalEquipos(equiposCompletos.length);

            // Calcular totales manualmente desde los datos completos
            const totalInventario = equiposCompletos.reduce((sum, e) => sum + (e.costoEquipo || 0), 0);
            const totalFacturado = equiposCompletos.reduce((sum, e) => sum + (e.precioVendido || 0), 0);
            const totalGanancia = equiposCompletos.reduce((sum, e) => sum + ((e.precioVendido || 0) - (e.costoEquipo || 0)), 0);
            const totalItbis = equiposCompletos.reduce((sum, e) => sum + (e.itbis || 0), 0);

            this.obtenerTotalInventario(totalInventario);
            this.obtenerTotalFacturado(totalFacturado);
            this.obtenerTotalGanancia(totalGanancia);
            this.obtenerTotalItbis(totalItbis);
          } else {
            this.totalRecord = 0;
            this.obtenerTotalEquipos(0);
            this.obtenerTotalInventario(0);
            this.obtenerTotalFacturado(0);
            this.obtenerTotalGanancia(0);
            this.obtenerTotalItbis(0);
          }

          // Paginación en el cliente
          this.aplicarPaginacionCliente();

          // Generar insights (ya no necesita otra llamada)
          this.generateSalesInsights();

          this.isLoading = false;
        },
        error: (error) => {
          console.error("Error al obtener equipos vendidos:", error);
          this.isLoading = false;
          this.isLoadingInsights = false;
          this.equiposVendidos = [];
          this.equiposVendidosCompletos = [];
          this.salesInsights = [];
        }
      });
  }

  // NUEVO: Método para paginar en el cliente
  aplicarPaginacionCliente() {
    const startIndex = (this.filter.pageIndex - 1) * this.filter.pageSize;
    const endIndex = startIndex + this.filter.pageSize;

    this.equiposVendidos = this.equiposVendidosCompletos.slice(startIndex, endIndex);

    // Calcular line y lastLine para mostrar "Mostrando X al Y de Z"
    this.line = this.equiposVendidosCompletos.length > 0 ? startIndex + 1 : 0;
    this.lastLine = Math.min(endIndex, this.equiposVendidosCompletos.length);

    console.log(`Paginación cliente: Mostrando ${this.line} al ${this.lastLine} de ${this.totalRecord}`);
  }
  printReportEquipoVendido(){
    this.isLoading = true; // Iniciar carga
    this.equipoService.postEquipoVendido(this.filter)
    .subscribe((blobResp)=>{
      this.isPrint = !this.isPrint;
      this.isLoading = false; // Terminar carga
      CreatorPDFFile(blobResp);
    },(err)=>{
      this.isPrint = !this.isPrint;
      this.toast.error('Error','Error al imprimir reporte');
    })
    this.isPrint = !this.isPrint;
  }

  /**
   * Copia el IMEI al portapapeles
   * @param imei - IMEI a copiar
   */
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
  obtenerAlmacenLista() {
    this.loading.showLoading();
    this.catalogosService.getSucursales().subscribe((almacen) => {
      this.almacenListado = almacen;
    });
    this.loading.hideLoading();
  }
  obtenerModeloLista() {
    this.loading.showLoading();
    this.catalogosService.getModeloLista().subscribe((modelo) => {
      this.modeloListado = modelo;
    });
    this.loading.hideLoading();
  }
  obtenerVendedor() {
    this.loading.showLoading();
    this.vendedorService.getVendedorLista().subscribe((vendedor) => {
      this.listaVendedor = vendedor;
    });
    this.loading.hideLoading();
  }
  obtenerSuplidor() {
    this.loading.showLoading();
    this.catalogosService.getSuplidorLista().subscribe((suplidor) => {
      this.listaSuplidor = suplidor;
    });
    this.loading.hideLoading();
  }

  // Método para formatear números con separadores de coma
  formatNumber(value: number): string {
    return value.toLocaleString('es-DO');
  }

  // Método para formatear rango de fechas para insights
  formatDateRange(): string {
    const fechaInicial = this.filter.fechaInicioFactura;
    const fechaFinal = this.filter.fechaFinalFactura;

    console.log('📅 DEBUG FECHAS:', {
      fechaInicial,
      fechaFinal,
      filterCompleto: this.filter
    });

    if (!fechaInicial || !fechaFinal) {
      return 'Sin filtro de fecha';
    }

    try {
      // Crear fechas asegurando el formato correcto
      const dateInicial = new Date(fechaInicial + 'T00:00:00');
      const dateFinal = new Date(fechaFinal + 'T00:00:00');

      console.log('📅 FECHAS PROCESADAS:', {
        dateInicial,
        dateFinal
      });

      const formatOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      };

      const fechaInicialFormateada = dateInicial.toLocaleDateString('es-DO', formatOptions);
      const fechaFinalFormateada = dateFinal.toLocaleDateString('es-DO', formatOptions);

      console.log('📅 FECHAS FORMATEADAS:', {
        fechaInicialFormateada,
        fechaFinalFormateada
      });

      return `${fechaInicialFormateada} - ${fechaFinalFormateada}`;
    } catch (error) {
      console.error('❌ ERROR EN FORMATEO DE FECHAS:', error);
      return 'Rango de fechas inválido';
    }
  }  // Método para generar insights de ventas
  generateSalesInsights() {
    // CAMBIADO: Usar equiposVendidosCompletos (todos los datos) en lugar de equiposVendidos (paginados)
    if (!this.equiposVendidosCompletos || this.equiposVendidosCompletos.length === 0) {
      this.salesInsights = [];
      this.isLoadingInsights = false;
      return;
    }

    // Análisis de modelos más y menos vendidos
    const modeloStats = new Map<string, number>();
    this.equiposVendidosCompletos.forEach(equipo => {  // CAMBIADO: Usar equiposVendidosCompletos
      const modelo = equipo.descripcion || 'Sin modelo';
      modeloStats.set(modelo, (modeloStats.get(modelo) || 0) + 1);
    });

    const modelosOrdenados = Array.from(modeloStats.entries()).sort((a, b) => b[1] - a[1]);
    const modeloMasVendido = modelosOrdenados.length > 0 ? modelosOrdenados[0] : null;
    const modeloMenosVendido = modelosOrdenados.length > 0 ? modelosOrdenados[modelosOrdenados.length - 1] : null;

    // Análisis de vendedores más y menos efectivos
    const vendedorStats = new Map<string, { cantidad: number, monto: number }>();
    this.equiposVendidosCompletos.forEach(equipo => {  // CAMBIADO: Usar equiposVendidosCompletos
      const vendedor = equipo.vendedor || 'Sin vendedor';
      const current = vendedorStats.get(vendedor) || { cantidad: 0, monto: 0 };
      vendedorStats.set(vendedor, {
        cantidad: current.cantidad + 1,
        monto: current.monto + (equipo.precioVendido || 0)
      });
    });

    const vendedoresOrdenados = Array.from(vendedorStats.entries()).sort((a, b) => b[1].monto - a[1].monto);
    const vendedorTop = vendedoresOrdenados.length > 0 ? vendedoresOrdenados[0] : null;
    const vendedorBajo = vendedoresOrdenados.length > 0 ? vendedoresOrdenados[vendedoresOrdenados.length - 1] : null;

    // Crear insights
    this.salesInsights = [];

    if (modeloMasVendido) {
      this.salesInsights.push({
        title: 'Modelo Más Vendido',
        value: `${modeloMasVendido[0]}`,
        description: `${this.formatNumber(modeloMasVendido[1])} unidades vendidas (${this.formatDateRange()})`,
        icon: 'bi bi-trophy-fill',
        iconColor: 'text-success-custom'
      });
    }

    if (modeloMenosVendido && modelosOrdenados.length > 1) {
      this.salesInsights.push({
        title: 'Modelo Menos Vendido',
        value: `${modeloMenosVendido[0]}`,
        description: `${this.formatNumber(modeloMenosVendido[1])} unidades vendidas`,
        icon: 'bi bi-arrow-down-circle-fill',
        iconColor: 'text-danger-custom'
      });
    }

    if (vendedorTop) {
      this.salesInsights.push({
        title: 'Vendedor Top',
        value: `${vendedorTop[0]}`,
        description: `${this.formatNumber(vendedorTop[1].cantidad)} ventas - RD$${this.formatNumber(vendedorTop[1].monto)}`,
        icon: 'bi bi-person-check-fill',
        iconColor: 'text-primary-custom'
      });
    }

    if (vendedorBajo && vendedoresOrdenados.length > 1) {
      this.salesInsights.push({
        title: 'Vendedor con Menos Ventas',
        value: `${vendedorBajo[0]}`,
        description: `${this.formatNumber(vendedorBajo[1].cantidad)} ventas - RD$${this.formatNumber(vendedorBajo[1].monto)}`,
        icon: 'bi bi-person-dash-fill',
        iconColor: 'text-warning-custom'
      });
    }

    this.isLoadingInsights = false;
  }

  /**
   * Selecciona un mensaje aleatorio para el loading de insights
   * Se ejecuta una vez al iniciar el componente
   */
  private seleccionarMensajeAleatorioInsights(): void {
    const indiceAleatorio = Math.floor(Math.random() * this.mensajesInsightsDisponibles.length);
    this.mensajeCargaInsights = this.mensajesInsightsDisponibles[indiceAleatorio];
    console.log('[EquipoConsultaVendido] Mensaje insights seleccionado:', this.mensajeCargaInsights.titulo);
  }

}
