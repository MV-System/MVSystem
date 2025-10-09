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

@Component({
  selector: 'app-utilidades',
  templateUrl: './utilidades.component.html',
  styleUrls: ['./utilidades.component.css']
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
    this.view = [600, 180]; // Tamaño normal para escritorio
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
    this.UtilidadesServices
      .GetUtilidades(this.filter)
      .subscribe(
        (equipos: Utilidades) => {
          if (equipos) {
            this.data = equipos; // Asigna el primer objeto a data
            this.updateSingleData();
            this.generateAIInsights(); // Generar insights automáticos
            this.loading.hideLoading();
          } else {
            this.toastr.warning('No se encontraron utilidades.');
          }
        },
        (error) => {
          this.toastr.error('Error al cargar datos de utilidades');
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
        detalle: `Representa el ${porcentajeContribucion}% de tus ganancias totales ($${mejorCategoria.ganancia.toFixed(2)})`
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
        mensaje: `Ganancias totales: $${totalGanancias.toFixed(2)}`,
        detalle: `Ventas: $${totalVentas.toFixed(2)} | Costos: $${totalCostos.toFixed(2)}`
      });
    }

    // 7. Alerta si no hay datos
    if (totalVentas === 0) {
      this.aiInsights.push({
        tipo: 'info',
        icono: 'ℹ️',
        mensaje: 'No hay datos para el período seleccionado',
        detalle: 'Intenta seleccionar un rango de fechas diferente'
      });
    }
  }

  onSelect(data: any): void { }

  onActivate(data: any): void { }

  onDeactivate(data: any): void { }
}
