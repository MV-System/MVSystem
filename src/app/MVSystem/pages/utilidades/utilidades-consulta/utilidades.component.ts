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
  ganancia_Equipos:0,
  costo_Accesorios:0,
  venta_Accesorios:0,
  ganancia_Accesorios:0,
  costo_Reparaciones:0,
  venta_Reparaciones:0,
  ganancia_Reparaciones:0,
  costo_Desbloqueos:0,
  venta_Desbloqueos:0,
  ganancia_Desbloqueos:0,
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
    dateFormat: 'dd.mm.yyyy',
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
  }> = [];

  constructor(
    private loading: LoadingService,
    private catalogosService: CatalogosService,
    private UtilidadesServices: UtilidadesService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loginService: LoginService,
    private validatorPermissionService:ValidatorPermissionService,
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
    fechainicio: [this.FechaInicio.toISOString().split('T')[0], Validators.required],
    fechafin: [this.fechaHoy.toISOString().split('T')[0], Validators.required],
    almacen: [Number(this.loginService.getUserIdSucursal), Validators.required]
  });
}

  ngOnInit(): void {
     this.setResponsiveView();
     window.addEventListener('resize', () => this.setResponsiveView());
    this.createForm();
    this.getSucursales();
    this.GetUtilidades(); // Llama a la función para obtener datos
    this.createForm();
    this.sucursalOnChange();
    // this.loading.hideLoading();
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
  GetUtilidades() {
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
      .subscribe(
        (equipos: Utilidades) => {
          if (equipos) {
            this.data = equipos; // Asigna datos actuales

            // Obtener datos del período anterior para comparación
            this.UtilidadesServices
              .GetUtilidades(filtroAnterior)
              .subscribe(
                (datosAnteriores: Utilidades) => {
                  this.dataAnterior = datosAnteriores;
                  this.updateSingleData();
                  this.generateAIInsights(); // Generar insights básicos
                  this.analizarTendencias(); // Generar insights de tendencias
                  this.loading.hideLoading();
                },
                (error) => {
                  // Si falla la obtención del período anterior, continuar sin comparación
                  console.warn('No se pudieron obtener datos del período anterior:', error);
                  this.dataAnterior = null;
                  this.updateSingleData();
                  this.generateAIInsights();
                  this.loading.hideLoading();
                }
              );
          } else {
            this.toastr.warning('No se encontraron utilidades.');
            this.loading.hideLoading();
          }
        },
        (error) => {
          this.toastr.error('Error al cargar datos de utilidades');
          this.loading.hideLoading();
        }
      );
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
  private calcularDiasDiferencia(fecha1: string, fecha2: string): number {
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

    // Calcular totales
    const totalVentas = this.data.venta_Equipos + this.data.venta_Accesorios +
                        this.data.venta_Reparaciones + this.data.venta_Desbloqueos;
    const totalGanancias = this.data.ganancia_Equipos + this.data.ganancia_Accesorios +
                          this.data.ganancia_Reparaciones + this.data.ganancia_Desbloqueos;
    const totalCostos = this.data.costo_Equipos + this.data.costo_Accesorios +
                       this.data.costo_Reparaciones + this.data.costo_Desbloqueos;

    // 1. Análisis de categoría más rentable
    const categorias = [
      { nombre: 'Equipos', ganancia: this.data.ganancia_Equipos, venta: this.data.venta_Equipos },
      { nombre: 'Accesorios', ganancia: this.data.ganancia_Accesorios, venta: this.data.venta_Accesorios },
      { nombre: 'Reparaciones', ganancia: this.data.ganancia_Reparaciones, venta: this.data.venta_Reparaciones },
      { nombre: 'Desbloqueos', ganancia: this.data.ganancia_Desbloqueos, venta: this.data.venta_Desbloqueos }
    ];

    const mejorCategoria = categorias.reduce((prev, current) =>
      (prev.ganancia > current.ganancia) ? prev : current
    );

    if (mejorCategoria.ganancia > 0) {
      const porcentajeContribucion = ((mejorCategoria.ganancia / totalGanancias) * 100).toFixed(1);
      this.aiInsights.push({
        tipo: 'success',
        icono: '🏆',
        mensaje: `${mejorCategoria.nombre} es tu categoría más rentable`,
        detalle: `Representa el ${porcentajeContribucion}% de tus ganancias totales ($${this.formatNumber(mejorCategoria.ganancia)})`
      });
    }

    // 2. Análisis de margen de ganancia general
    const margenGeneral = totalVentas > 0 ? ((totalGanancias / totalVentas) * 100) : 0;
    if (margenGeneral > 30) {
      this.aiInsights.push({
        tipo: 'success',
        icono: '📈',
        mensaje: `Excelente margen de ganancia: ${margenGeneral.toFixed(1)}%`,
        detalle: `Tus ganancias representan más del 30% de las ventas totales`
      });
    } else if (margenGeneral < 15) {
      this.aiInsights.push({
        tipo: 'warning',
        icono: '⚠️',
        mensaje: `Margen de ganancia bajo: ${margenGeneral.toFixed(1)}%`,
        detalle: `Considera revisar precios o reducir costos para mejorar rentabilidad`
      });
    } else {
      this.aiInsights.push({
        tipo: 'info',
        icono: '📊',
        mensaje: `Margen de ganancia moderado: ${margenGeneral.toFixed(1)}%`,
        detalle: `Hay oportunidad de optimizar para aumentar rentabilidad`
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
            detalle: `Revisa costos o ajusta precios en esta categoría`
          });
        }
      }
    });

    // 4. Identificar categoría con peor rendimiento
    const peorCategoria = categorias
      .filter(c => c.venta > 0)
      .reduce((prev, current) => {
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
          detalle: `Esta categoría tiene un margen del ${margenPeor.toFixed(1)}%, menor al promedio`
        });
      }
    }

    // 5. Análisis de distribución de ventas
    const categoriaConMasVentas = categorias.reduce((prev, current) =>
      (prev.venta > current.venta) ? prev : current
    );

    if (categoriaConMasVentas.venta > totalVentas * 0.6) {
      this.aiInsights.push({
        tipo: 'warning',
        icono: '⚖️',
        mensaje: `Alta dependencia en ${categoriaConMasVentas.nombre}`,
        detalle: `El ${((categoriaConMasVentas.venta / totalVentas) * 100).toFixed(1)}% de tus ventas provienen de esta categoría. Considera diversificar.`
      });
    }

    // 6. Resumen general positivo
    if (totalGanancias > 0) {
      this.aiInsights.push({
        tipo: 'success',
        icono: '💰',
        mensaje: `Ganancias totales: $${this.formatNumber(totalGanancias)}`,
        detalle: `Ventas: $${this.formatNumber(totalVentas)} | Costos: $${this.formatNumber(totalCostos)}`
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
            detalle: `Ventas: $${this.formatNumber(cat.ventaAnterior)} → $${this.formatNumber(cat.ventaActual)}`
          });
        }
      }

      // Análisis de GANANCIAS
      if (cat.gananciaAnterior > 0) {
        const crecimientoGanancias = ((cat.gananciaActual - cat.gananciaAnterior) / cat.gananciaAnterior) * 100;

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
              detalle: `Posible aumento en costos o reducción de precios. Revisar márgenes.`
            });
          }
        }

        // Destacar mejoras significativas en ganancias
        if (crecimientoGanancias > 30) {
          this.aiInsights.unshift({
            tipo: 'success',
            icono: '💰',
            mensaje: `${cat.nombre}: Excelente crecimiento en ganancias (+${crecimientoGanancias.toFixed(1)}%)`,
            detalle: `Ganancias: $${this.formatNumber(cat.gananciaAnterior)} → $${this.formatNumber(cat.gananciaActual)}`
          });
        }
      }
    });

    // Análisis GENERAL de totales
    const totalVentasActual = this.data.venta_Equipos + this.data.venta_Accesorios +
                              this.data.venta_Reparaciones + this.data.venta_Desbloqueos;
    const totalVentasAnterior = this.dataAnterior.venta_Equipos + this.dataAnterior.venta_Accesorios +
                                this.dataAnterior.venta_Reparaciones + this.dataAnterior.venta_Desbloqueos;

    const totalGananciasActual = this.data.ganancia_Equipos + this.data.ganancia_Accesorios +
                                 this.data.ganancia_Reparaciones + this.data.ganancia_Desbloqueos;
    const totalGananciasAnterior = this.dataAnterior.ganancia_Equipos + this.dataAnterior.ganancia_Accesorios +
                                   this.dataAnterior.ganancia_Reparaciones + this.dataAnterior.ganancia_Desbloqueos;

    if (totalVentasAnterior > 0) {
      const crecimientoTotal = ((totalVentasActual - totalVentasAnterior) / totalVentasAnterior) * 100;

      if (crecimientoTotal > 10) {
        this.aiInsights.unshift({
          tipo: 'success',
          icono: '🎉',
          mensaje: `Ventas totales crecieron ${crecimientoTotal.toFixed(1)}%`,
          detalle: `De $${this.formatNumber(totalVentasAnterior)} a $${this.formatNumber(totalVentasActual)}`
        });
      } else if (crecimientoTotal < -10) {
        this.aiInsights.unshift({
          tipo: 'warning',
          icono: '⚠️',
          mensaje: `Ventas totales cayeron ${Math.abs(crecimientoTotal).toFixed(1)}%`,
          detalle: `De $${this.formatNumber(totalVentasAnterior)} a $${this.formatNumber(totalVentasActual)}`
        });
      }
    }

    if (totalGananciasAnterior > 0) {
      const crecimientoGananciasTotal = ((totalGananciasActual - totalGananciasAnterior) / totalGananciasAnterior) * 100;

      if (crecimientoGananciasTotal > 15) {
        this.aiInsights.unshift({
          tipo: 'success',
          icono: '💎',
          mensaje: `Ganancias totales aumentaron ${crecimientoGananciasTotal.toFixed(1)}%`,
          detalle: `De $${this.formatNumber(totalGananciasAnterior)} a $${this.formatNumber(totalGananciasActual)}`
        });
      }
    }

    // IMPORTANTE: Agregar el separador de contexto al final para que aparezca PRIMERO
    // Esto establece el contexto para que el usuario entienda las comparaciones
    this.aiInsights.unshift({
      tipo: 'info',
      icono: '📊',
      mensaje: 'Análisis de Tendencias vs Período Anterior',
      detalle: `Comparando ${this.filter.FI} a ${this.filter.FF} con período anterior`
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
}
