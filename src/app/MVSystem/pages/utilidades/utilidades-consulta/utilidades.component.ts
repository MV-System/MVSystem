import { Component, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/auth/login.service';
import { Almacen } from 'src/app/core/interfaces/catalogo.interface';
import { Utilidades, utilidadesFiltros } from 'src/app/core/interfaces/utilidades.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { UtilidadesService } from 'src/app/core/services/utilidades.service';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { UserTrackingService } from 'src/app/core/services/user-tracking.service';

@Component({
  selector: 'app-utilidades',
  templateUrl: './utilidades.component.html',
  styleUrls: ['./utilidades.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class UtilidadesComponent implements OnInit {

  get rangoFechas(): string {
  return `${this.FechaInicio.toLocaleDateString()} - ${this.fechaHoy.toLocaleDateString()}`;
}

  almacenes!: Almacen[];
  subs: Subscription[] = [];
  // options
 view: [number, number] = [100, 150]; // ancho, alto
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  data: Utilidades = {
    costo_Equipos: 0,
    venta_Equipos: 0,
    itbis_Equipos: 0,
    ganancia_Equipos: 0,
    costo_Accesorios: 0,
    venta_Accesorios: 0,
    itbis_Accesorios: 0,
    ganancia_Accesorios: 0,
    costo_Reparaciones: 0,
    venta_Reparaciones: 0,
    itbis_Reparaciones: 0,
    ganancia_Reparaciones: 0,
    costo_Desbloqueos: 0,
    venta_Desbloqueos: 0,
    itbis_Desbloqueos: 0,
    ganancia_Desbloqueos: 0,
    valida: 0
  }; // Inicializa data

  // Datos del período anterior para comparación
  dataAnterior: Utilidades | null = null;

  isLoading: boolean = false; // Variable para controlar el estado de carga

  rangeDatePlaceholder: Date =new Date()
  colorScheme1 = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd/mm/yyyy',
    showClearBtn: true,
    showClearDateRangeBtn: true,
    showApplyBtn: true,
    showSelectDateText: true,
    selectBeginDateTxt: 'Inicio',
    selectEndDateTxt: 'Fin',
    firstDayOfWeek: 'mo',
    sunHighlight: true,
    height: '34px',
    width: '100%',
    selectionTxtFontSize: '14px',
    inline: false,
    showWeekNumbers: false,
    editableDateRangeField: false,
    openSelectorOnInputClick: true,
    monthLabels: {
      1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr', 5: 'May', 6: 'Jun',
      7: 'Jul', 8: 'Ago', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic'
    },
    dayLabels: {
      su: 'Dom', mo: 'Lun', tu: 'Mar', we: 'Mié', th: 'Jue', fr: 'Vie', sa: 'Sáb'
    }
  };
  singleVentas = [
    { "name": "Ventas Equipos", "value": this.data.venta_Equipos },
    { "name": "Ventas Acc.", "value": this.data.venta_Accesorios },
    { "name": "Ventas Desblq.", "value": this.data.venta_Desbloqueos },
    { "name": "Ventas Reps.", "value": this.data.venta_Reparaciones }
  ];
  singleGanancias = [
    { "name": "Ganancia Equipos", "value": this.data.ganancia_Equipos },
    { "name": "Ganancia Acc.", "value": this.data.ganancia_Accesorios },
    { "name": "Ganancia Desblq.", "value": this.data.ganancia_Desbloqueos },
    { "name": "Ganancia Reps.", "value": this.data.ganancia_Reparaciones }
  ];
  singleCostos = [
    { "name": "Costo Equipos", "value": this.data.costo_Equipos },
    { "name": "Costo Acc.", "value": this.data.costo_Accesorios },
    { "name": "Costo Desblq.", "value": this.data.costo_Desbloqueos },
    { "name": "Costo Reps.", "value": this.data.costo_Reparaciones }
  ];

  // IA - Insights automáticos
  aiInsights: Array<{
    tipo: 'success' | 'warning' | 'info' | 'danger';
    icono: string;
    mensaje: string;
    detalle?: string;
    metadata?: {
      categoria?: string;
      valor?: number;
      porcentaje?: number;
      fechaInicio?: string;
      fechaFin?: string;
      comparacion?: string;
      margen?: number;
      totalVentas?: number;
      totalGanancias?: number;
      totalCostos?: number;
    };
  }> = [];

  // Variable para el insight seleccionado en el modal
  insightSeleccionado: any = null;

  constructor(
    private loading: LoadingService,
    private catalogosService: CatalogosService,
    private UtilidadesServices: UtilidadesService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loginService: LoginService,
    private validatorPermissionService:ValidatorPermissionService,
    private tracking: UserTrackingService
  ) { }

  // Obtener la fecha actual
 fechaHoy = new Date();
 // Crear una nueva fecha para el primer día del mes actual
FechaInicio = new Date(this.fechaHoy.getFullYear(), this.fechaHoy.getMonth(), 1);
SelectSucursal(): boolean {
  return this.validatorPermissionService.validateUserRole("CB_SUCURSAL");
}

getSucursales() {
  this.loading.showLoading();
  const sub = this.catalogosService.getSucursales().subscribe((almacen) => {
    this.almacenes = almacen;
  });
  this.loading.hideLoading();
}


form!: FormGroup;
createForm(){
  this.form = this.fb.group({
    rangeDate: [null], // Control para el datepicker
    fechainicio: [this.FechaInicio.toISOString().split('T')[0], Validators.required],
    fechafin: [this.fechaHoy.toISOString().split('T')[0], Validators.required],
    almacen: [Number(this.loginService.getUserIdSucursal), Validators.required]
  });
}

  ngOnInit(): void {
     this.setResponsiveView();
     window.addEventListener('resize', () => this.setResponsiveView());
    this.createForm(); // Crear el formulario PRIMERO
    this.getSucursales();
    this.sucursalOnChange(); // Configurar listeners ANTES de cargar datos

    // Cargar datos iniciales SIN tracking (solo PageView)
    this.cargarDatosIniciales();

    // 📊 Tracking: Registro de acceso al módulo
    this.tracking.trackPageView('verUtilidadesToolStripMenuItem', 'PageView').subscribe();
  }
setResponsiveView() {
  if (window.innerWidth < 600) {
    this.view = [300, 200]; // Más pequeño para móvil
  } else {
    this.view = [1200, 180]; // Ancho ampliado para evitar scroll horizontal
  }
}
  onDateRangeChanged(event: any) {
    if (event.beginDate.year === 0) {
      this.filter.FI = this.FechaInicio.toISOString().split('T')[0],
      this.filter.FF = this.fechaHoy.toISOString().split('T')[0]
      this.filter.sucursal = this.form.get('almacen')?.value

    } else {
      this.filter.FI = `${event.beginDate.month}/${event.beginDate.day}/${event.beginDate.year}`;
      this.filter.FF = `${event.endDate.month}/${event.endDate.day}/${event.endDate.year}`;
      this.filter.sucursal = this.form.get('almacen')?.value
    }

    // Llama a GetUtilidades después de actualizar los filtros
    this.GetUtilidades();
  }
  sucursalOnChange() {
    this.form.get('almacen')?.valueChanges.subscribe((value) => {
      if (value) { // Verificar que 'value' tiene un valor válido
        this.filter.sucursal = value;
        this.GetUtilidades(); // Llama a la función de consulta al cambiar la sucursal
      }
    });
  }

  /**
   * Carga los datos iniciales sin tracking (se usa en ngOnInit)
   */
  private cargarDatosIniciales() {
    this.loading.showLoading();

    // Limpiar insights anteriores
    this.aiInsights = [];

    // Calcular fechas del período anterior
    const periodoAnterior = this.calcularPeriodoAnterior();
    const filtroAnterior: utilidadesFiltros = {
      ...this.filter,
      FI: periodoAnterior.FI,
      FF: periodoAnterior.FF
    };

    // Obtener datos del período actual
    this.UtilidadesServices
      .GetUtilidades(this.filter)
      .subscribe({
        next: (equipos: Utilidades) => {
          if (equipos && equipos !== null) {
            this.data = equipos; // Asigna datos actuales

            // Obtener datos del período anterior para comparación
            this.UtilidadesServices
              .GetUtilidades(filtroAnterior)
              .subscribe({
                next: (datosAnteriores: Utilidades) => {
                  this.dataAnterior = datosAnteriores;
                  this.updateSingleData();
                  this.generateAIInsights(); // Generar insights básicos
                  this.analizarTendencias(); // Generar insights de tendencias
                  this.loading.hideLoading();
                },
                error: (error) => {
                  // Si falla la obtención del período anterior, continuar sin comparación
                  console.warn('No se pudieron obtener datos del período anterior:', error);
                  this.dataAnterior = null;
                  this.updateSingleData();
                  this.generateAIInsights();
                  this.loading.hideLoading();
                },
                complete: () => {
                  // Asegurar que se oculte el loading incluso si no hay error ni data
                  if (this.loading) {
                    this.loading.hideLoading();
                  }
                }
              });
          } else {
            this.toastr.warning('No se encontraron utilidades.');
            this.loading.hideLoading();
          }
        },
        error: (error) => {
          console.error('Error al cargar datos de utilidades:', error);
          this.toastr.error('Error al cargar datos de utilidades');
          this.loading.hideLoading();
        },
        complete: () => {
          // Asegurar que siempre se oculte el loading
          console.log('Consulta de utilidades completada');
        }
      });
  }

  GetUtilidades() {
    this.loading.showLoading();

    // 📊 Tracking: Registro de consulta de utilidades
    this.tracking.trackAction('verUtilidadesToolStripMenuItem', 'Consulta').subscribe();

    // Limpiar insights anteriores
    this.aiInsights = [];

    // Calcular fechas del período anterior
    const periodoAnterior = this.calcularPeriodoAnterior();
    const filtroAnterior: utilidadesFiltros = {
      ...this.filter,
      FI: periodoAnterior.FI,
      FF: periodoAnterior.FF
    };

    // Obtener datos del período actual
    this.UtilidadesServices
      .GetUtilidades(this.filter)
      .subscribe({
        next: (equipos: Utilidades) => {
          if (equipos && equipos !== null) {
            this.data = equipos; // Asigna datos actuales

            // Obtener datos del período anterior para comparación
            this.UtilidadesServices
              .GetUtilidades(filtroAnterior)
              .subscribe({
                next: (datosAnteriores: Utilidades) => {
                  this.dataAnterior = datosAnteriores;
                  this.updateSingleData();
                  this.generateAIInsights(); // Generar insights básicos
                  this.analizarTendencias(); // Generar insights de tendencias
                  this.loading.hideLoading();
                },
                error: (error) => {
                  // Si falla la obtención del período anterior, continuar sin comparación
                  console.warn('No se pudieron obtener datos del período anterior:', error);
                  this.dataAnterior = null;
                  this.updateSingleData();
                  this.generateAIInsights();
                  this.loading.hideLoading();
                },
                complete: () => {
                  // Asegurar que se oculte el loading incluso si no hay error ni data
                  if (this.loading) {
                    this.loading.hideLoading();
                  }
                }
              });
          } else {
            this.toastr.warning('No se encontraron utilidades.');
            this.loading.hideLoading();
          }
        },
        error: (error) => {
          console.error('Error al cargar datos de utilidades:', error);
          this.toastr.error('Error al cargar datos de utilidades');
          this.loading.hideLoading();
        },
        complete: () => {
          // Asegurar que siempre se oculte el loading
          console.log('Consulta de utilidades completada');
        }
      });
  }

  private updateSingleData() {
   this.singleVentas = [
    { "name": "Ventas Equipos", "value": this.data.venta_Equipos },
    { "name": "Ventas Acc.", "value": this.data.venta_Accesorios },
    { "name": "Ventas Desblq.", "value": this.data.venta_Desbloqueos },
    { "name": "Ventas Reps.", "value": this.data.venta_Reparaciones }
  ];
  this.singleGanancias = [
    { "name": "Ganancia Equipos", "value": this.data.ganancia_Equipos },
    { "name": "Ganancia Acc.", "value": this.data.ganancia_Accesorios },
    { "name": "Ganancia Desblq.", "value": this.data.ganancia_Desbloqueos },
    { "name": "Ganancia Reps.", "value": this.data.ganancia_Reparaciones }
  ];
  this.singleCostos = [
    { "name": "Costo Equipos", "value": this.data.costo_Equipos },
    { "name": "Costo Acc.", "value": this.data.costo_Accesorios },
    { "name": "Costo Desblq.", "value": this.data.costo_Desbloqueos },
    { "name": "Costo Reps.", "value": this.data.costo_Reparaciones }
  ];
  }

  filter: utilidadesFiltros = {
    FI: this.FechaInicio.toISOString().split('T')[0],
    FF: this.fechaHoy.toISOString().split('T')[0],
    sucursal:+this.loginService.getUserIdSucursal, // Asegúrate de que esto retorne el valor correcto
  };

  /**
   * Calcula la diferencia en días entre dos fechas
   */
  calcularDiasDiferencia(fecha1: string, fecha2: string): number {
    const f1 = new Date(fecha1);
    const f2 = new Date(fecha2);
    const diferencia = Math.abs(f2.getTime() - f1.getTime());
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }

  /**
   * Resta días a una fecha y retorna el string en formato ISO
   */
  private restarDias(fecha: string, dias: number): string {
    const date = new Date(fecha);
    date.setDate(date.getDate() - dias);
    return date.toISOString().split('T')[0];
  }

  /**
   * Calcula las fechas del período anterior basándose en el período actual
   */
  private calcularPeriodoAnterior(): { FI: string, FF: string } {
    const diasDiferencia = this.calcularDiasDiferencia(this.filter.FI, this.filter.FF);
    const fechaFinAnterior = this.restarDias(this.filter.FI, 1);
    const fechaInicioAnterior = this.restarDias(fechaFinAnterior, diasDiferencia);

    return {
      FI: fechaInicioAnterior,
      FF: fechaFinAnterior
    };
  }

  /**
   * Genera insights automáticos con IA basados en los datos de utilidades
   */
  private generateAIInsights(): void {
    this.aiInsights = [];

    // Validar que existan datos antes de procesar
    if (!this.data) {
      console.warn('[UtilidadesComponent] No hay datos para generar insights');
      return;
    }

    // Calcular totales
    const totalVentas = this.data.venta_Equipos + this.data.venta_Accesorios +
                        this.data.venta_Reparaciones + this.data.venta_Desbloqueos;
    const totalGanancias = this.data.ganancia_Equipos + this.data.ganancia_Accesorios +
                          this.data.ganancia_Reparaciones + this.data.ganancia_Desbloqueos;
    const totalCostos = this.data.costo_Equipos + this.data.costo_Accesorios +
                       this.data.costo_Reparaciones + this.data.costo_Desbloqueos;

    // Si no hay movimiento, no generar insights
    if (totalVentas === 0 && totalGanancias === 0 && totalCostos === 0) {
      console.info('[UtilidadesComponent] No hay movimiento en el período seleccionado');
      return;
    }

    // 1. Análisis de categoría más rentable
    const categorias = [
      { nombre: 'Equipos', ganancia: this.data.ganancia_Equipos, venta: this.data.venta_Equipos },
      { nombre: 'Accesorios', ganancia: this.data.ganancia_Accesorios, venta: this.data.venta_Accesorios },
      { nombre: 'Reparaciones', ganancia: this.data.ganancia_Reparaciones, venta: this.data.venta_Reparaciones },
      { nombre: 'Desbloqueos', ganancia: this.data.ganancia_Desbloqueos, venta: this.data.venta_Desbloqueos }
    ];

    if (categorias.length > 0) {
      const mejorCategoria = categorias.reduce((prev, current) =>
        (prev.ganancia > current.ganancia) ? prev : current
      );

      if (mejorCategoria.ganancia > 0) {
        const porcentajeContribucion = ((mejorCategoria.ganancia / totalGanancias) * 100).toFixed(1);
        this.aiInsights.push({
          tipo: 'success',
          icono: '🏆',
          mensaje: `${mejorCategoria.nombre} es tu categoría más rentable`,
          detalle: `Representa el ${porcentajeContribucion}% de tus ganancias totales ($${this.formatNumber(mejorCategoria.ganancia)})`,
          metadata: {
            categoria: mejorCategoria.nombre,
            valor: mejorCategoria.ganancia,
            porcentaje: parseFloat(porcentajeContribucion),
            fechaInicio: this.filter.FI,
            fechaFin: this.filter.FF,
            totalVentas: mejorCategoria.venta,
            totalGanancias: totalGanancias
          }
        });
      }
    }

    // 2. Análisis de margen de ganancia general
    const margenGeneral = totalVentas > 0 ? ((totalGanancias / totalVentas) * 100) : 0;
    if (margenGeneral > 30) {
      this.aiInsights.push({
        tipo: 'success',
        icono: '📈',
        mensaje: `Excelente margen de ganancia: ${margenGeneral.toFixed(1)}%`,
        detalle: `Tus ganancias representan más del 30% de las ventas totales`,
        metadata: {
          margen: margenGeneral,
          totalVentas: totalVentas,
          totalGanancias: totalGanancias,
          totalCostos: totalCostos,
          fechaInicio: this.filter.FI,
          fechaFin: this.filter.FF
        }
      });
    } else if (margenGeneral < 15) {
      this.aiInsights.push({
        tipo: 'warning',
        icono: '⚠️',
        mensaje: `Margen de ganancia bajo: ${margenGeneral.toFixed(1)}%`,
        detalle: `Considera revisar precios o reducir costos para mejorar rentabilidad`,
        metadata: {
          margen: margenGeneral,
          totalVentas: totalVentas,
          totalGanancias: totalGanancias,
          totalCostos: totalCostos,
          fechaInicio: this.filter.FI,
          fechaFin: this.filter.FF
        }
      });
    } else {
      this.aiInsights.push({
        tipo: 'info',
        icono: '📊',
        mensaje: `Margen de ganancia moderado: ${margenGeneral.toFixed(1)}%`,
        detalle: `Hay oportunidad de optimizar para aumentar rentabilidad`,
        metadata: {
          margen: margenGeneral,
          totalVentas: totalVentas,
          totalGanancias: totalGanancias,
          totalCostos: totalCostos,
          fechaInicio: this.filter.FI,
          fechaFin: this.filter.FF
        }
      });
    }

    // 3. Análisis de márgenes por categoría
    categorias.forEach(cat => {
      if (cat.venta > 0) {
        const margen = ((cat.ganancia / cat.venta) * 100);
        if (margen < 10 && cat.venta > totalVentas * 0.1) { // Solo si representa más del 10% de ventas
          this.aiInsights.push({
            tipo: 'warning',
            icono: '⚡',
            mensaje: `${cat.nombre}: Margen muy bajo (${margen.toFixed(1)}%)`,
            detalle: `Revisa costos o ajusta precios en esta categoría`,
            metadata: {
              categoria: cat.nombre,
              margen: margen,
              totalVentas: cat.venta,
              totalGanancias: cat.ganancia,
              fechaInicio: this.filter.FI,
              fechaFin: this.filter.FF
            }
          });
        }
      }
    });

    // 4. Identificar categoría con peor rendimiento
    const categoriasConVentas = categorias.filter(c => c.venta > 0);
    if (categoriasConVentas.length > 0) {
      const peorCategoria = categoriasConVentas.reduce((prev, current) => {
        const margenPrev = prev.venta > 0 ? (prev.ganancia / prev.venta) : 0;
        const margenCurrent = current.venta > 0 ? (current.ganancia / current.venta) : 0;
        return margenPrev < margenCurrent ? prev : current;
      });

      if (peorCategoria && peorCategoria.venta > 0) {
        const margenPeor = ((peorCategoria.ganancia / peorCategoria.venta) * 100);
        if (margenPeor < margenGeneral - 10) {
          this.aiInsights.push({
            tipo: 'info',
            icono: '💡',
            mensaje: `Oportunidad en ${peorCategoria.nombre}`,
            detalle: `Esta categoría tiene un margen del ${margenPeor.toFixed(1)}%, menor al promedio`,
            metadata: {
              categoria: peorCategoria.nombre,
              margen: margenPeor,
              totalVentas: peorCategoria.venta,
              totalGanancias: peorCategoria.ganancia,
              fechaInicio: this.filter.FI,
              fechaFin: this.filter.FF,
              comparacion: `Margen promedio: ${margenGeneral.toFixed(1)}%`
            }
          });
        }
      }
    }

    // 5. Análisis de distribución de ventas
    if (categorias.length > 0) {
      const categoriaConMasVentas = categorias.reduce((prev, current) =>
        (prev.venta > current.venta) ? prev : current
      );

      if (categoriaConMasVentas.venta > totalVentas * 0.6) {
        this.aiInsights.push({
          tipo: 'warning',
          icono: '⚖️',
          mensaje: `Alta dependencia en ${categoriaConMasVentas.nombre}`,
          detalle: `El ${((categoriaConMasVentas.venta / totalVentas) * 100).toFixed(1)}% de tus ventas provienen de esta categoría. Considera diversificar.`,
          metadata: {
            categoria: categoriaConMasVentas.nombre,
            valor: categoriaConMasVentas.venta,
            porcentaje: (categoriaConMasVentas.venta / totalVentas) * 100,
            totalVentas: totalVentas,
            fechaInicio: this.filter.FI,
            fechaFin: this.filter.FF
          }
        });
      }
    }

    // 6. Resumen general positivo
    if (totalGanancias > 0) {
      this.aiInsights.push({
        tipo: 'success',
        icono: '💰',
        mensaje: `Ganancias totales: $${this.formatNumber(totalGanancias)}`,
        detalle: `Ventas: $${this.formatNumber(totalVentas)} | Costos: $${this.formatNumber(totalCostos)}`,
        metadata: {
          totalVentas: totalVentas,
          totalGanancias: totalGanancias,
          totalCostos: totalCostos,
          margen: margenGeneral,
          fechaInicio: this.filter.FI,
          fechaFin: this.filter.FF
        }
      });
    }

    // 7. Alerta si no hay datos
    if (totalVentas === 0) {
      const sucursalSeleccionada = this.almacenes?.find(a => a.iD_Almacen == this.filter.sucursal);
      const nombreSucursal = sucursalSeleccionada ? sucursalSeleccionada.descripcion : 'La sucursal seleccionada';

      this.aiInsights.push({
        tipo: 'warning',
        icono: '📋',
        mensaje: `${nombreSucursal} no tiene movimientos para realizar análisis`,
        detalle: `No se registraron ventas en el período seleccionado (${this.filter.FI} - ${this.filter.FF}). Verifica que el rango de fechas sea correcto o selecciona una sucursal diferente.`
      });
    }
  }

  /**
   * Analiza tendencias comparando el período actual con el anterior
   */
  private analizarTendencias(): void {
    if (!this.dataAnterior) {
      return; // No hay datos del período anterior para comparar
    }

    // Calcular totales para ambos períodos
    const totalVentasAct = this.data.venta_Equipos + this.data.venta_Accesorios +
                           this.data.venta_Reparaciones + this.data.venta_Desbloqueos;
    const totalGananciasAct = this.data.ganancia_Equipos + this.data.ganancia_Accesorios +
                              this.data.ganancia_Reparaciones + this.data.ganancia_Desbloqueos;
    const totalCostosAct = totalVentasAct - totalGananciasAct;

    const totalVentasAnt = this.dataAnterior.venta_Equipos + this.dataAnterior.venta_Accesorios +
                           this.dataAnterior.venta_Reparaciones + this.dataAnterior.venta_Desbloqueos;
    const totalGananciasAnt = this.dataAnterior.ganancia_Equipos + this.dataAnterior.ganancia_Accesorios +
                              this.dataAnterior.ganancia_Reparaciones + this.dataAnterior.ganancia_Desbloqueos;
    const totalCostosAnt = totalVentasAnt - totalGananciasAnt;

    const margenAct = totalVentasAct > 0 ? (totalGananciasAct / totalVentasAct) * 100 : 0;
    const margenAnt = totalVentasAnt > 0 ? (totalGananciasAnt / totalVentasAnt) * 100 : 0;

    // Definir categorías para analizar
    interface Categoria {
      nombre: string;
      ventaActual: number;
      ventaAnterior: number;
      gananciaActual: number;
      gananciaAnterior: number;
    }

    const categorias: Categoria[] = [
      {
        nombre: 'Equipos',
        ventaActual: this.data.venta_Equipos,
        ventaAnterior: this.dataAnterior.venta_Equipos,
        gananciaActual: this.data.ganancia_Equipos,
        gananciaAnterior: this.dataAnterior.ganancia_Equipos
      },
      {
        nombre: 'Accesorios',
        ventaActual: this.data.venta_Accesorios,
        ventaAnterior: this.dataAnterior.venta_Accesorios,
        gananciaActual: this.data.ganancia_Accesorios,
        gananciaAnterior: this.dataAnterior.ganancia_Accesorios
      },
      {
        nombre: 'Reparaciones',
        ventaActual: this.data.venta_Reparaciones,
        ventaAnterior: this.dataAnterior.venta_Reparaciones,
        gananciaActual: this.data.ganancia_Reparaciones,
        gananciaAnterior: this.dataAnterior.ganancia_Reparaciones
      },
      {
        nombre: 'Desbloqueos',
        ventaActual: this.data.venta_Desbloqueos,
        ventaAnterior: this.dataAnterior.venta_Desbloqueos,
        gananciaActual: this.data.ganancia_Desbloqueos,
        gananciaAnterior: this.dataAnterior.ganancia_Desbloqueos
      }
    ];

    // Analizar cada categoría
    categorias.forEach(cat => {
      // Análisis de VENTAS
      if (cat.ventaAnterior > 0) {
        const crecimientoVentas = ((cat.ventaActual - cat.ventaAnterior) / cat.ventaAnterior) * 100;
        const margenCat = cat.ventaActual > 0 ? (cat.gananciaActual / cat.ventaActual) * 100 : 0;

        // Solo mostrar si hay cambio significativo (más de 5%)
        if (Math.abs(crecimientoVentas) > 5) {
          let tipo: 'success' | 'warning' | 'info' = 'info';
          let icono = '➡️';
          let accion = 'se mantiene';

          if (crecimientoVentas > 20) {
            tipo = 'success';
            icono = '🔥';
            accion = 'creció significativamente';
          } else if (crecimientoVentas > 0) {
            tipo = 'success';
            icono = '📈';
            accion = 'creció';
          } else if (crecimientoVentas < -20) {
            tipo = 'warning';
            icono = '📉';
            accion = 'cayó significativamente';
          } else {
            tipo = 'warning';
            icono = '📉';
            accion = 'disminuyó';
          }

          this.aiInsights.unshift({
            tipo,
            icono,
            mensaje: `${cat.nombre} ${accion} ${Math.abs(crecimientoVentas).toFixed(1)}%`,
            detalle: `Ventas: $${this.formatNumber(cat.ventaAnterior)} → $${this.formatNumber(cat.ventaActual)}`,
            metadata: {
              categoria: cat.nombre,
              valor: cat.ventaActual,
              porcentaje: crecimientoVentas,
              fechaInicio: this.filter.FI,
              fechaFin: this.filter.FF,
              totalVentas: cat.ventaActual,
              totalGanancias: cat.gananciaActual,
              totalCostos: cat.ventaActual - cat.gananciaActual,
              margen: margenCat,
              comparacion: `Período anterior: $${this.formatNumber(cat.ventaAnterior)}`
            }
          });
        }
      }

      // Análisis de GANANCIAS
      if (cat.gananciaAnterior > 0) {
        const crecimientoGanancias = ((cat.gananciaActual - cat.gananciaAnterior) / cat.gananciaAnterior) * 100;
        const margenCat = cat.ventaActual > 0 ? (cat.gananciaActual / cat.ventaActual) * 100 : 0;

        // Alerta si las ganancias cayeron más del 15% aunque las ventas suban
        if (crecimientoGanancias < -15) {
          const crecimientoVentas = cat.ventaAnterior > 0
            ? ((cat.ventaActual - cat.ventaAnterior) / cat.ventaAnterior) * 100
            : 0;

          if (crecimientoVentas > 0) {
            this.aiInsights.unshift({
              tipo: 'warning',
              icono: '⚠️',
              mensaje: `${cat.nombre}: Ganancias cayeron ${Math.abs(crecimientoGanancias).toFixed(1)}% a pesar del aumento en ventas`,
              detalle: `Posible aumento en costos o reducción de precios. Revisar márgenes.`,
              metadata: {
                categoria: cat.nombre,
                valor: cat.gananciaActual,
                porcentaje: crecimientoGanancias,
                fechaInicio: this.filter.FI,
                fechaFin: this.filter.FF,
                totalVentas: cat.ventaActual,
                totalGanancias: cat.gananciaActual,
                totalCostos: cat.ventaActual - cat.gananciaActual,
                margen: margenCat,
                comparacion: `Ganancias anteriores: $${this.formatNumber(cat.gananciaAnterior)}, Ventas crecieron: +${crecimientoVentas.toFixed(1)}%`
              }
            });
          }
        }

        // Destacar mejoras significativas en ganancias
        if (crecimientoGanancias > 30) {
          this.aiInsights.unshift({
            tipo: 'success',
            icono: '💰',
            mensaje: `${cat.nombre}: Excelente crecimiento en ganancias (+${crecimientoGanancias.toFixed(1)}%)`,
            detalle: `Ganancias: $${this.formatNumber(cat.gananciaAnterior)} → $${this.formatNumber(cat.gananciaActual)}`,
            metadata: {
              categoria: cat.nombre,
              valor: cat.gananciaActual,
              porcentaje: crecimientoGanancias,
              fechaInicio: this.filter.FI,
              fechaFin: this.filter.FF,
              totalVentas: cat.ventaActual,
              totalGanancias: cat.gananciaActual,
              totalCostos: cat.ventaActual - cat.gananciaActual,
              margen: margenCat,
              comparacion: `Período anterior: $${this.formatNumber(cat.gananciaAnterior)}`
            }
          });
        }
      }
    });

    // Análisis GENERAL de totales
    if (totalVentasAnt > 0) {
      const crecimientoTotal = ((totalVentasAct - totalVentasAnt) / totalVentasAnt) * 100;

      if (crecimientoTotal > 10) {
        this.aiInsights.unshift({
          tipo: 'success',
          icono: '🎉',
          mensaje: `Ventas totales crecieron ${crecimientoTotal.toFixed(1)}%`,
          detalle: `De $${this.formatNumber(totalVentasAnt)} a $${this.formatNumber(totalVentasAct)}`,
          metadata: {
            valor: totalVentasAct,
            porcentaje: crecimientoTotal,
            fechaInicio: this.filter.FI,
            fechaFin: this.filter.FF,
            totalVentas: totalVentasAct,
            totalGanancias: totalGananciasAct,
            totalCostos: totalCostosAct,
            margen: margenAct,
            comparacion: `Período anterior: $${this.formatNumber(totalVentasAnt)} (Margen: ${margenAnt.toFixed(1)}%)`
          }
        });
      } else if (crecimientoTotal < -10) {
        this.aiInsights.unshift({
          tipo: 'warning',
          icono: '⚠️',
          mensaje: `Ventas totales cayeron ${Math.abs(crecimientoTotal).toFixed(1)}%`,
          detalle: `De $${this.formatNumber(totalVentasAnt)} a $${this.formatNumber(totalVentasAct)}`,
          metadata: {
            valor: totalVentasAct,
            porcentaje: crecimientoTotal,
            fechaInicio: this.filter.FI,
            fechaFin: this.filter.FF,
            totalVentas: totalVentasAct,
            totalGanancias: totalGananciasAct,
            totalCostos: totalCostosAct,
            margen: margenAct,
            comparacion: `Período anterior: $${this.formatNumber(totalVentasAnt)} (Caída de ${Math.abs(crecimientoTotal).toFixed(1)}%)`
          }
        });
      }
    }

    if (totalGananciasAnt > 0) {
      const crecimientoGananciasTotal = ((totalGananciasAct - totalGananciasAnt) / totalGananciasAnt) * 100;

      if (crecimientoGananciasTotal > 15) {
        this.aiInsights.unshift({
          tipo: 'success',
          icono: '💎',
          mensaje: `Ganancias totales aumentaron ${crecimientoGananciasTotal.toFixed(1)}%`,
          detalle: `De $${this.formatNumber(totalGananciasAnt)} a $${this.formatNumber(totalGananciasAct)}`,
          metadata: {
            valor: totalGananciasAct,
            porcentaje: crecimientoGananciasTotal,
            fechaInicio: this.filter.FI,
            fechaFin: this.filter.FF,
            totalVentas: totalVentasAct,
            totalGanancias: totalGananciasAct,
            totalCostos: totalCostosAct,
            margen: margenAct,
            comparacion: `Período anterior: $${this.formatNumber(totalGananciasAnt)} (Crecimiento: +${crecimientoGananciasTotal.toFixed(1)}%)`
          }
        });
      }
    }

    // IMPORTANTE: Agregar el separador de contexto al final para que aparezca PRIMERO
    // Esto establece el contexto para que el usuario entienda las comparaciones
    this.aiInsights.unshift({
      tipo: 'info',
      icono: '📊',
      mensaje: 'Análisis de Tendencias vs Período Anterior',
      detalle: `Comparando ${this.filter.FI} a ${this.filter.FF} con período anterior`,
      metadata: {
        fechaInicio: this.filter.FI,
        fechaFin: this.filter.FF,
        totalVentas: totalVentasAct,
        totalGanancias: totalGananciasAct,
        totalCostos: totalCostosAct,
        margen: margenAct,
        comparacion: `Período anterior - Ventas: $${this.formatNumber(totalVentasAnt)}, Ganancias: $${this.formatNumber(totalGananciasAnt)}, Margen: ${margenAnt.toFixed(1)}%`
      }
    });
  }

  onSelect(data: any): void { }

  onActivate(data: any): void { }

  onDeactivate(data: any): void { }

  // ========== Métodos Helper para la UI ==========

  /**
   * Calcula el total de ventas sumando todas las categorías
   */
  getTotalVentas(): number {
    return this.data.venta_Equipos +
           this.data.venta_Accesorios +
           this.data.venta_Desbloqueos +
           this.data.venta_Reparaciones;
  }

  getTotalItbis(): number {
    return this.data.itbis_Equipos +
           this.data.itbis_Accesorios +
           this.data.itbis_Desbloqueos +
           this.data.itbis_Reparaciones;
  }

  getTotalVentasSinItbis(): number {
    return Math.max(this.getTotalVentas() - this.getTotalItbis(), 0);
  }

  /**
   * Calcula el total de ganancias sumando todas las categorías
   */
  getTotalGanancias(): number {
    return this.data.ganancia_Equipos +
           this.data.ganancia_Accesorios +
           this.data.ganancia_Desbloqueos +
           this.data.ganancia_Reparaciones;
  }

  /**
   * Calcula el total de costos sumando todas las categorías
   */
  getTotalCostos(): number {
    return this.data.costo_Equipos +
           this.data.costo_Accesorios +
           this.data.costo_Desbloqueos +
           this.data.costo_Reparaciones;
  }

  /**
   * Calcula el margen de ganancia general (porcentaje)
   * Fórmula: (Ganancias / Ventas) * 100
   */
  getMargenGeneral(): number {
    const totalVentas = this.getTotalVentas();
    if (totalVentas === 0) return 0;

    const totalGanancias = this.getTotalGanancias();
    return Math.round((totalGanancias / totalVentas) * 100);
  }

  /**
   * Formatea un número con separadores de comas
   * @param value - El número a formatear
   * @param decimales - Número de decimales a mostrar (default: 2)
   * @returns Número formateado con comas
   */
  private formatNumber(value: number, decimales: number = 2): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    });
  }

  /**
   * Genera el tooltip completo para un insight con información contextual específica
   * Muestra datos detallados sobre el período, valores y comparaciones
   */
  getInsightTooltip(insight: any): string {
    if (!insight.metadata) {
      return `${insight.mensaje}\n\n${insight.detalle || ''}`;
    }

    const meta = insight.metadata;
    let tooltip = '📊 INFORMACIÓN DETALLADA\n';
    tooltip += '═'.repeat(40) + '\n\n';

    // Información del período
    if (meta.fechaInicio && meta.fechaFin) {
      const fechaInicioFormat = this.formatFechaTooltip(meta.fechaInicio);
      const fechaFinFormat = this.formatFechaTooltip(meta.fechaFin);
      tooltip += `📅 PERÍODO ANALIZADO:\n`;
      tooltip += `   Desde: ${fechaInicioFormat}\n`;
      tooltip += `   Hasta: ${fechaFinFormat}\n`;
      tooltip += `   Días: ${this.calcularDiasDiferencia(meta.fechaInicio, meta.fechaFin)} días\n\n`;
    }

    // Información específica según el tipo de insight
    if (meta.categoria) {
      tooltip += `🏷️  CATEGORÍA: ${meta.categoria}\n\n`;
    }

    // Datos financieros
    if (meta.totalVentas !== undefined) {
      tooltip += `💵 VENTAS: $${this.formatNumber(meta.totalVentas, 2)}\n`;
    }

    if (meta.totalGanancias !== undefined) {
      tooltip += `💰 GANANCIAS: $${this.formatNumber(meta.totalGanancias, 2)}\n`;
    }

    if (meta.totalCostos !== undefined) {
      tooltip += `💳 COSTOS: $${this.formatNumber(meta.totalCostos, 2)}\n`;
    }

    if (meta.margen !== undefined) {
      tooltip += `📊 MARGEN: ${meta.margen.toFixed(2)}%\n`;

      // Interpretación del margen
      if (meta.margen > 30) {
        tooltip += `   ✅ Margen excelente (>30%)\n`;
      } else if (meta.margen > 20) {
        tooltip += `   ✔️  Margen bueno (20-30%)\n`;
      } else if (meta.margen > 15) {
        tooltip += `   ⚠️  Margen moderado (15-20%)\n`;
      } else {
        tooltip += `   ❌ Margen bajo (<15%)\n`;
      }
    }

    if (meta.porcentaje !== undefined) {
      tooltip += `📈 CONTRIBUCIÓN: ${meta.porcentaje.toFixed(2)}%\n`;
    }

    if (meta.valor !== undefined && !meta.totalVentas) {
      tooltip += `💵 VALOR: $${this.formatNumber(meta.valor, 2)}\n`;
    }

    // Comparaciones
    if (meta.comparacion) {
      tooltip += `\n⚖️  ${meta.comparacion}\n`;
    }

    // Separador
    tooltip += '\n' + '─'.repeat(40) + '\n';

    // Mensaje principal
    tooltip += `\n� ${insight.mensaje}\n`;

    if (insight.detalle) {
      tooltip += `\n📝 ${insight.detalle}\n`;
    }

    return tooltip;
  }

  /**
   * Formatea una fecha para mostrar en tooltips
   */
  private formatFechaTooltip(fecha: string): string {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('es-DO', opciones);
  }

  /**
   * Genera el tooltip para el badge de tipo de insight
   */
  getInsightBadgeTooltip(tipo: string): string {
    const badges: { [key: string]: string } = {
      'success': '✅ Positivo: Indicador favorable para el negocio',
      'warning': '⚠️ Atención: Requiere revisión o ajustes',
      'danger': '🚨 Urgente: Requiere acción inmediata',
      'info': 'ℹ️ Informativo: Dato relevante para considerar'
    };

    return badges[tipo] || 'Tipo de insight';
  }

  /**
   * Muestra el modal con el detalle completo del insight
   */
  mostrarDetalleInsight(insight: any): void {
    this.insightSeleccionado = insight;
  }

  /**
   * Cierra el modal de detalle del insight
   */
  cerrarDetalleInsight(): void {
    this.insightSeleccionado = null;
  }

  /**
   * Formatea una fecha para mostrar de forma detallada
   */
  formatFechaDetallada(fecha: string): string {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('es-DO', opciones);
  }

  /**
   * Retorna la clase CSS según el margen de ganancia
   */
  getMargenClass(margen: number): string {
    if (margen > 30) return 'success';
    if (margen > 20) return 'good';
    if (margen > 15) return 'moderate';
    return 'danger';
  }

  /**
   * Formatea una fecha de forma corta
   */
  formatFechaCorta(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /**
   * Calcula el promedio diario de un valor en un período
   */
  calcularPromedioDiario(valor: number, fechaInicio: string, fechaFin: string): number {
    if (!valor || !fechaInicio || !fechaFin) return 0;
    const dias = this.calcularDiasDiferencia(fechaInicio, fechaFin) || 1;
    return valor / dias;
  }

  /**
   * Interpreta el margen de ganancia con texto descriptivo
   */
  interpretarMargen(margen: number): string {
    if (margen > 40) return '🎯 Excepcional - Rentabilidad muy superior al mercado';
    if (margen > 30) return '✅ Excelente - Rentabilidad saludable y sostenible';
    if (margen > 20) return '👍 Bueno - Margen competitivo en el sector';
    if (margen > 15) return '⚠️ Moderado - Hay oportunidad de mejora';
    if (margen > 10) return '📉 Bajo - Requiere optimización urgente';
    return '🚨 Crítico - Revisar estrategia de precios/costos';
  }

  /**
   * Calcula el porcentaje que representa un valor del total
   */
  calcularPorcentaje(valor: number, total: number): number {
    if (!total || total === 0) return 0;
    return (valor / total) * 100;
  }

  /**
   * Proyecta ventas para un período específico basado en el promedio actual
   */
  proyectarVentas(valorActual: number, fechaInicio: string, fechaFin: string, diasProyeccion: number): number {
    const promedioDiario = this.calcularPromedioDiario(valorActual, fechaInicio, fechaFin);
    return promedioDiario * diasProyeccion;
  }

  /**
   * Genera recomendaciones accionables basadas en el insight
   */
  generarRecomendaciones(insight: any): Array<{
    icono: string;
    titulo: string;
    descripcion: string;
    accion?: string;
    prioridad: 'alta' | 'media' | 'baja';
  }> {
    const recomendaciones: Array<any> = [];
    const meta = insight.metadata;

    if (!meta) return recomendaciones;

    // Recomendaciones basadas en margen
    if (meta.margen !== undefined) {
      if (meta.margen < 15) {
        recomendaciones.push({
          icono: '🚨',
          titulo: 'Optimizar Costos',
          descripcion: `El margen del ${meta.margen.toFixed(1)}% está por debajo del objetivo mínimo (15%). Es crítico revisar la estructura de costos.`,
          accion: 'Analizar proveedores alternativos, renegociar precios de compra, o ajustar precios de venta',
          prioridad: 'alta'
        });
      } else if (meta.margen < 20) {
        recomendaciones.push({
          icono: '⚠️',
          titulo: 'Incrementar Margen',
          descripcion: `Margen de ${meta.margen.toFixed(1)}% es aceptable pero puede mejorarse para alcanzar el objetivo óptimo de 20-30%.`,
          accion: 'Evaluar incremento moderado de precios o búsqueda de productos con mayor margen',
          prioridad: 'media'
        });
      } else if (meta.margen > 40) {
        recomendaciones.push({
          icono: '💡',
          titulo: 'Aprovechar Alta Rentabilidad',
          descripcion: `Margen excepcional de ${meta.margen.toFixed(1)}%. Esta categoría es muy rentable.`,
          accion: 'Aumentar inventario y esfuerzos de marketing en esta línea de productos',
          prioridad: 'alta'
        });
      }
    }

    // Recomendaciones basadas en participación
    if (meta.porcentaje !== undefined) {
      if (meta.porcentaje > 60) {
        recomendaciones.push({
          icono: '⚖️',
          titulo: 'Diversificar Portfolio',
          descripcion: `${meta.categoria || 'Esta categoría'} representa el ${meta.porcentaje.toFixed(1)}% del total. Alta concentración = alto riesgo.`,
          accion: 'Desarrollar otras líneas de negocio para reducir dependencia',
          prioridad: 'alta'
        });
      } else if (meta.porcentaje < 10 && meta.totalVentas && meta.totalVentas > 0) {
        recomendaciones.push({
          icono: '📈',
          titulo: 'Potencial de Crecimiento',
          descripcion: `Baja participación (${meta.porcentaje.toFixed(1)}%) indica oportunidad de expansión.`,
          accion: 'Evaluar si vale la pena invertir más recursos o considerar descontinuar',
          prioridad: 'media'
        });
      }
    }

    // Recomendaciones basadas en volumen
    if (meta.totalVentas !== undefined && meta.fechaInicio && meta.fechaFin) {
      const promedioDiario = this.calcularPromedioDiario(meta.totalVentas, meta.fechaInicio, meta.fechaFin);

      if (promedioDiario > 10000) {
        recomendaciones.push({
          icono: '💰',
          titulo: 'Alto Volumen de Ventas',
          descripcion: `Promedio diario de $${promedioDiario.toFixed(2)} indica alta demanda.`,
          accion: 'Asegurar inventario suficiente y considerar expandir capacidad',
          prioridad: 'media'
        });
      } else if (promedioDiario < 1000) {
        recomendaciones.push({
          icono: '📊',
          titulo: 'Bajo Volumen',
          descripcion: `Ventas diarias promedio de $${promedioDiario.toFixed(2)} están por debajo de lo esperado.`,
          accion: 'Implementar estrategias de marketing o promociones',
          prioridad: 'media'
        });
      }
    }

    // Recomendación general de análisis
    if (meta.fechaInicio && meta.fechaFin) {
      const dias = this.calcularDiasDiferencia(meta.fechaInicio, meta.fechaFin);
      if (dias >= 30) {
        recomendaciones.push({
          icono: '📅',
          titulo: 'Análisis Periódico',
          descripcion: `Basado en ${dias} días de datos. Los resultados son estadísticamente significativos.`,
          accion: 'Continuar monitoreando estas métricas mensualmente',
          prioridad: 'baja'
        });
      } else {
        recomendaciones.push({
          icono: '⏱️',
          titulo: 'Período Corto',
          descripcion: `Solo ${dias} días analizados. Considerar período más largo para conclusiones definitivas.`,
          accion: 'Reanalizar con 30+ días para validar tendencias',
          prioridad: 'baja'
        });
      }
    }

    // Recomendación de costos si están altos
    if (meta.totalCostos && meta.totalVentas) {
      const ratioCostos = (meta.totalCostos / meta.totalVentas) * 100;
      if (ratioCostos > 70) {
        recomendaciones.push({
          icono: '💸',
          titulo: 'Costos Elevados',
          descripcion: `Los costos representan el ${ratioCostos.toFixed(1)}% de las ventas. Ratio muy alto.`,
          accion: 'Revisar cadena de suministro, negociar con proveedores, o aumentar precios',
          prioridad: 'alta'
        });
      }
    }

    return recomendaciones;
  }
}
