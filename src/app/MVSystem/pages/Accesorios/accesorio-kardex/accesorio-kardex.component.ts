import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Almacen } from 'src/app/core/interfaces/catalogo.interface';
import { AccesorioKardexBusqueda, KardexMovimiento, MotivoMovimiento } from 'src/app/core/interfaces/laptop.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { LaptopsService } from 'src/app/core/services/laptops.service';

/** Kardex de un accesorio: ventas, piezas instaladas en cambios de pieza y piezas retiradas recibidas. */
@Component({
  selector: 'app-accesorio-kardex',
  templateUrl: './accesorio-kardex.component.html',
  styleUrls: ['./accesorio-kardex.component.css']
})
export class AccesorioKardexComponent implements OnInit {
  almacenes: Almacen[] = [];
  resultados: AccesorioKardexBusqueda[] = [];
  seleccionado: AccesorioKardexBusqueda | null = null;
  movimientos: KardexMovimiento[] = [];

  isBuscando = false;
  isCargando = false;
  busquedaHecha = false;

  formBusqueda: FormGroup = this.fb.group({
    almacen: [null],
    filtro: ['']
  });

  formFechas: FormGroup = this.fb.group({
    fechaInicio: [this.fechaTexto(this.primerDiaMes()), ],
    fechaFinal: [this.fechaTexto(new Date())]
  });

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private laptopsService: LaptopsService,
    private catalogosService: CatalogosService
  ) { }

  ngOnInit(): void {
    this.catalogosService.getAlmaceLista().subscribe({
      next: (lista) => this.almacenes = lista || [],
      error: () => this.toastr.error('No se pudo cargar la lista de almacenes.')
    });
  }

  private primerDiaMes(): Date {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  }

  private fechaTexto(fecha: Date): string {
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }

  get totalEntradas(): number {
    return this.movimientos.reduce((t, m) => t + (m.entrada || 0), 0);
  }

  get totalSalidas(): number {
    return this.movimientos.reduce((t, m) => t + (m.salida || 0), 0);
  }

  get saldoInicial(): number | null {
    return this.movimientos.length ? this.movimientos[0].saldo : null;
  }

  get saldoFinal(): number | null {
    return this.movimientos.length ? this.movimientos[this.movimientos.length - 1].saldo : null;
  }

  get existenciaActual(): number | null {
    return this.movimientos.length ? this.movimientos[0].existencia_Actual : null;
  }

  /** Los movimientos reales (sin la línea del saldo inicial). */
  get lineas(): KardexMovimiento[] {
    return this.movimientos.filter(m => m.motivo !== 'SALDO_INICIAL');
  }

  buscar() {
    this.isBuscando = true;
    const f = this.formBusqueda.getRawValue();
    this.laptopsService.buscarAccesoriosKardex(f.almacen, (f.filtro || '').trim()).subscribe({
      next: (lista) => {
        this.resultados = lista || [];
        this.busquedaHecha = true;
        this.isBuscando = false;
      },
      error: (err) => {
        this.isBuscando = false;
        this.toastr.error(this.mensajeError(err, 'No se pudo buscar el accesorio.'));
      }
    });
  }

  elegir(accesorio: AccesorioKardexBusqueda) {
    this.seleccionado = accesorio;
    this.consultar();
  }

  cambiarAccesorio() {
    this.seleccionado = null;
    this.movimientos = [];
  }

  consultar() {
    if (!this.seleccionado) { return; }
    const { fechaInicio, fechaFinal } = this.formFechas.getRawValue();
    if (!fechaInicio || !fechaFinal || fechaInicio > fechaFinal) {
      this.toastr.error('Indique un rango de fechas válido.');
      return;
    }
    this.isCargando = true;
    this.laptopsService.consultarKardex(this.seleccionado.iD_Accesorio, fechaInicio, fechaFinal).subscribe({
      next: (lista) => {
        this.movimientos = lista || [];
        this.isCargando = false;
      },
      error: (err) => {
        this.isCargando = false;
        this.toastr.error(this.mensajeError(err, 'No se pudo consultar el kardex.'));
      }
    });
  }

  textoMotivo(motivo: MotivoMovimiento): string {
    switch (motivo) {
      case 'VENTA': return 'Venta (factura)';
      case 'CAMBIO_PIEZA': return 'Cambio de pieza (instalada)';
      case 'RECEPCION': return 'Pieza retirada recibida';
      case 'SALDO_INICIAL': return 'Saldo inicial';
      default: return motivo;
    }
  }

  private mensajeError(err: any, porDefecto: string): string {
    // El interceptor de errores devuelve el mensaje del API como texto en los 400
    if (typeof err === 'string' && err) { return err; }
    const e = err?.error;
    if (typeof e === 'string' && e) { return e; }
    if (e?.message) { return e.message; }
    return porDefecto;
  }
}
