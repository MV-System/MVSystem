import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { Almacen } from 'src/app/core/interfaces/catalogo.interface';
import { ConsumoComponente, MotivoMovimiento } from 'src/app/core/interfaces/laptop.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { LaptopsService } from 'src/app/core/services/laptops.service';
import { SeguridadService } from '../../seguridad/servicios/seguridad.service';

interface ResumenLinea {
  clave: string;
  entradas: number;
  salidas: number;
}

/** Reporte general de consumo de componentes: qué piezas salieron del inventario, por qué y quién. */
@Component({
  selector: 'app-componentes-consumo',
  templateUrl: './componentes-consumo.component.html',
  styleUrls: ['./componentes-consumo.component.css']
})
export class ComponentesConsumoComponent implements OnInit {
  readonly tiposPieza = [
    { valor: 'RAM', texto: 'Memoria RAM' },
    { valor: 'ALMACENAMIENTO', texto: 'Almacenamiento' }
  ];
  readonly motivos: { valor: MotivoMovimiento; texto: string }[] = [
    { valor: 'VENTA', texto: 'Venta (factura)' },
    { valor: 'CAMBIO_PIEZA', texto: 'Cambio de pieza (instalada)' },
    { valor: 'RECEPCION', texto: 'Pieza retirada recibida' }
  ];

  almacenes: Almacen[] = [];
  tecnicos: { login: string; etiqueta: string }[] = [];
  movimientos: ConsumoComponente[] = [];
  consultado = false;
  isCargando = false;

  form: FormGroup = this.fb.group({
    fechaInicio: [this.fechaTexto(this.primerDiaMes())],
    fechaFinal: [this.fechaTexto(new Date())],
    almacen: [null],
    tecnico: [null],
    tipoPieza: [null],
    motivo: [null]
  });

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private laptopsService: LaptopsService,
    private catalogosService: CatalogosService,
    private seguridadService: SeguridadService
  ) { }

  ngOnInit(): void {
    this.catalogosService.getAlmaceLista().subscribe({
      next: (lista) => this.almacenes = lista || [],
      error: () => this.toastr.error('No se pudo cargar la lista de almacenes.')
    });
    this.seguridadService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.tecnicos = (usuarios || [])
          .filter(u => u.estado === 1 && u.login)
          .map(u => ({ login: u.login, etiqueta: `${u.nombre} (${u.login})` }));
      },
      error: () => this.toastr.error('No se pudo cargar la lista de técnicos.')
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

  textoMotivo(motivo: MotivoMovimiento): string {
    return this.motivos.find(m => m.valor === motivo)?.texto || motivo;
  }

  get totalEntradas(): number {
    return this.movimientos.reduce((t, m) => t + (m.entrada || 0), 0);
  }

  get totalSalidas(): number {
    return this.movimientos.reduce((t, m) => t + (m.salida || 0), 0);
  }

  /** Costo de lo que salió del inventario (salidas × costo actual del accesorio). */
  get costoSalidas(): number {
    return this.movimientos.reduce((t, m) => t + (m.salida || 0) * Number(m.costo || 0), 0);
  }

  get porMotivo(): ResumenLinea[] {
    return this.agrupar(m => this.textoMotivo(m.motivo));
  }

  get porAccesorio(): ResumenLinea[] {
    return this.agrupar(m => `${m.modelo} · ${m.descripcion_Accesorio} (${m.descripcion_Almacen})`);
  }

  private agrupar(clave: (m: ConsumoComponente) => string): ResumenLinea[] {
    const mapa = new Map<string, ResumenLinea>();
    this.movimientos.forEach(m => {
      const k = clave(m);
      const linea = mapa.get(k) || { clave: k, entradas: 0, salidas: 0 };
      linea.entradas += m.entrada || 0;
      linea.salidas += m.salida || 0;
      mapa.set(k, linea);
    });
    return Array.from(mapa.values()).sort((a, b) => b.salidas - a.salidas || b.entradas - a.entradas);
  }

  consultar() {
    const f = this.form.getRawValue();
    if (!f.fechaInicio || !f.fechaFinal || f.fechaInicio > f.fechaFinal) {
      this.toastr.error('Indique un rango de fechas válido.');
      return;
    }
    this.isCargando = true;
    this.laptopsService.consultarConsumo(f.fechaInicio, f.fechaFinal, f.almacen, f.tecnico, f.tipoPieza, f.motivo).subscribe({
      next: (lista) => {
        this.movimientos = lista || [];
        this.consultado = true;
        this.isCargando = false;
      },
      error: (err) => {
        this.isCargando = false;
        this.toastr.error(this.mensajeError(err, 'No se pudo consultar el consumo de componentes.'));
      }
    });
  }

  exportarExcel() {
    if (!this.movimientos.length) { return; }
    const filas = this.movimientos.map(m => ({
      'Fecha': m.fecha ? new Date(m.fecha).toLocaleString('es-DO') : '',
      'Movimiento': this.textoMotivo(m.motivo),
      'Documento': m.documento || '',
      'Accesorio': m.descripcion_Accesorio,
      'Modelo': m.modelo,
      'Tipo de pieza': m.tipo_Pieza,
      'Almacén': m.descripcion_Almacen,
      'Entrada': m.entrada,
      'Salida': m.salida,
      'Costo': Number(m.costo || 0),
      'Usuario': m.usuario || '',
      'Técnico': m.tecnico || ''
    }));
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Consumo');
    const f = this.form.getRawValue();
    XLSX.writeFile(libro, `Consumo_componentes_${f.fechaInicio}_${f.fechaFinal}.xlsx`);
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
