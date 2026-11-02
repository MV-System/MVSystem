import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { LoginService } from 'src/app/auth/login.service';
import { AccesorioMovimiento, AccesorioMovimientoResumen } from 'src/app/core/interfaces/accesorio.interface';
import { Almacen } from 'src/app/core/interfaces/catalogo.interface';
import { AccesoriosService } from 'src/app/core/services/accesorios.service';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';

/** Vista "Movimientos" de la consulta de accesorios: quién, cuándo, cuánto y por qué cambió la existencia. */
@Component({
  selector: 'app-accesorio-movimientos',
  templateUrl: './accesorio-movimientos.component.html',
  styleUrls: ['./accesorio-movimientos.component.css']
})
export class AccesorioMovimientosComponent implements OnInit {

  readonly motivos: { valor: string; texto: string }[] = [
    { valor: 'ENTRADA', texto: 'Entrada' },
    { valor: 'AJUSTE', texto: 'Ajuste' },
    { valor: 'AJUSTE_INVENTARIO', texto: 'Ajuste de inventario' },
    { valor: 'VENTA', texto: 'Venta' },
    { valor: 'ANULACION_FACTURA', texto: 'Anulación de factura' },
    { valor: 'TRANSFERENCIA', texto: 'Transferencia' },
    { valor: 'CAMBIO_PIEZA', texto: 'Cambio de pieza' },
    { valor: 'RECEPCION_PIEZA', texto: 'Recepción de pieza' },
    { valor: 'ANULACION_CAMBIO', texto: 'Anulación de cambio' },
  ];

  almacenes: Almacen[] = [];
  movimientos: AccesorioMovimiento[] = [];
  resumen: AccesorioMovimientoResumen[] = [];
  total = 0;
  pageIndex = 1;
  pageSize = 20;
  cargando = false;
  error = '';
  periodoRapido: 'hoy' | 'semana' | 'mes' | 'personalizado' = 'mes';

  form: FormGroup = this.fb.group({
    filtro: [''],
    sucursal: [this.loginService.getUserIdSucursal],
    motivo: [''],
    usuario: [''],
    fechaInicio: [this.formatearFechaISO(this.inicioDeMes())],
    fechaFinal: [this.formatearFechaISO(new Date())],
    rangeDate: [''],
  });

  myDateRangePickerOptions: IMyDrpOptions = { dateFormat: 'dd.mm.yyyy' };

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private validatorPermissionService: ValidatorPermissionService,
    private accesoriosService: AccesoriosService,
    private catalogosService: CatalogosService) { }

  ngOnInit(): void {
    this.catalogosService.getSucursales().subscribe(almacenes => this.almacenes = almacenes);
    this.buscar();
  }

  SelectSucursal(): boolean {
    return this.validatorPermissionService.validateUserRole('CB_SUCURSAL');
  }

  buscar(reiniciarPagina = true): void {
    if (reiniciarPagina) { this.pageIndex = 1; }
    const v = this.form.value;
    if (!v.fechaInicio || !v.fechaFinal) { return; }

    this.cargando = true;
    this.error = '';
    this.accesoriosService.getMovimientos({
      fechaInicio: v.fechaInicio,
      fechaFinal: v.fechaFinal,
      sucursal: Number(v.sucursal) || 0,
      filtro: (v.filtro || '').trim(),
      motivo: v.motivo || '',
      usuario: (v.usuario || '').trim(),
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
    }).subscribe({
      next: r => {
        this.movimientos = r.items;
        this.resumen = r.resumen;
        this.total = r.total;
        this.cargando = false;
      },
      error: e => {
        this.cargando = false;
        this.movimientos = [];
        this.resumen = [];
        this.total = 0;
        this.error = typeof e?.error === 'string' && e.error ? e.error : 'No se pudieron cargar los movimientos.';
      }
    });
  }

  pageChanged(index: number): void {
    this.pageIndex = index;
    this.buscar(false);
  }

  onDateRangeChanged(event: any): void {
    this.periodoRapido = 'personalizado';
    if (event.beginDate.year === 0) {
      this.form.patchValue({ fechaInicio: '', fechaFinal: '' });
    } else {
      const b = event.beginDate, e = event.endDate;
      this.form.patchValue({
        fechaInicio: `${b.year}-${String(b.month).padStart(2, '0')}-${String(b.day).padStart(2, '0')}`,
        fechaFinal: `${e.year}-${String(e.month).padStart(2, '0')}-${String(e.day).padStart(2, '0')}`
      });
    }
    this.buscar();
  }

  get rangoFechas(): string {
    const v = this.form.value;
    return `${this.fechaVisible(v.fechaInicio)} - ${this.fechaVisible(v.fechaFinal)}`;
  }

  private fechaVisible(valor: string): string {
    const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor || '');
    return p ? new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3])).toLocaleDateString() : '';
  }

  seleccionarPeriodoRapido(periodo: 'hoy' | 'semana' | 'mes'): void {
    const hoy = new Date();
    let inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    if (periodo === 'semana') {
      inicio.setDate(inicio.getDate() - ((hoy.getDay() + 6) % 7));
    } else if (periodo === 'mes') {
      inicio = this.inicioDeMes();
    }
    this.periodoRapido = periodo;
    this.form.patchValue({ fechaInicio: this.formatearFechaISO(inicio), fechaFinal: this.formatearFechaISO(hoy) });
    this.buscar();
  }

  limpiar(): void {
    this.form.patchValue({ filtro: '', motivo: '', usuario: '' });
    this.seleccionarPeriodoRapido('mes');
  }

  textoMotivo(valor: string): string {
    return this.motivos.find(m => m.valor === valor)?.texto ?? valor;
  }

  claseMotivo(m: AccesorioMovimiento): string {
    return m.entrada > 0 ? 'bg-success' : (m.salida > 0 ? 'bg-danger' : 'bg-secondary');
  }

  get totalEntradas(): number { return this.resumen.reduce((a, r) => a + r.entradas, 0); }
  get totalSalidas(): number { return this.resumen.reduce((a, r) => a + r.salidas, 0); }

  private inicioDeMes(): Date {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  }

  private formatearFechaISO(fecha: Date): string {
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }
}
