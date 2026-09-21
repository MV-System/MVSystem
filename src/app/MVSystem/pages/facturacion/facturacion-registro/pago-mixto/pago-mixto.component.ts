import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';

export interface DetallePago {
  ID_Tipo_Pago: number;
  Descripcion_Tipo_Pago?: string;
  Monto_Pago: number;
  Numero_Referencia?: string;
  Observacion?: string;
}

@Component({
  selector: 'app-pago-mixto',
  templateUrl: './pago-mixto.component.html',
  styleUrls: ['./pago-mixto.component.css']
})
export class PagoMixtoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() totalFactura: number = 0;
  @Input() tiposPago: any[] = [];
  @Input() tipoPagoSeleccionado: number = 0;
  @Input() detallesIniciales: DetallePago[] = [];
  @Output() pagosMixtoChange = new EventEmitter<DetallePago[]>();
  @Output() tipoPagoChange = new EventEmitter<number>();

  form: FormGroup;
  pagosTotales: number = 0;
  saldoPendiente: number = 0;
  ID_PAGO_MIXTO = 6; // Constante para tipo Mixto
  Math = Math; // Para usar Math en el template
  private filasInicializadas = false;
  private detallesInicialesCargados = false;
  tiposPagoFiltrados: any[] = [];

  private normalizarMonto(valor: number): number {
    const monto = Number(valor ?? 0);
    return Number.isFinite(monto) ? Number(monto.toFixed(2)) : 0;
  }

  private getTotalFacturaNumerico(): number {
    const total = Number(this.totalFactura ?? 0);
    return Number.isFinite(total) ? this.normalizarMonto(total) : 0;
  }

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      detallesPagos: this.fb.array([])
    });
  }

  ngOnInit() {
    // ngOnChanges se encargará de inicializar si es necesario
    // ngOnInit no debe duplicar filas
  }

  ngOnDestroy() {
    this.detallesPagos.clear();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tiposPago']) {
      // Recalcular tipos de pago filtrados cuando cambie tiposPago
      this.actualizarTiposPagoFiltrados();
    }
    if (changes['tipoPagoSeleccionado']) {
      const nuevoTipo = changes['tipoPagoSeleccionado'].currentValue;
      if (nuevoTipo === this.ID_PAGO_MIXTO) {
        // Reinicializar completamente
        this.detallesPagos.clear();
        // Agregar exactamente 2 filas
        for (let i = 0; i < 2; i++) {
          this.agregarFilaPago();
        }
        this.filasInicializadas = true;
        // Actualizar totales después de crear las filas
        this.actualizarTotales();
      } else {
        // Limpiar si NO es mixto
        this.detallesPagos.clear();
        this.pagosTotales = 0;
        this.saldoPendiente = 0;
        this.pagosMixtoChange.emit([]);
        this.filasInicializadas = false;
      }
    }
    if (changes['detallesIniciales'] && !this.detallesInicialesCargados && this.tipoPagoSeleccionado === this.ID_PAGO_MIXTO) {
      this.cargarDetallesIniciales(changes['detallesIniciales'].currentValue || []);
    }
    // Recalcular saldo cuando cambia el total de la factura
    if (changes['totalFactura'] && !changes['totalFactura'].firstChange) {
      this.actualizarTotales();
    }
  }

  private cargarDetallesIniciales(detalles: DetallePago[]) {
    if (!detalles.length) return;

    this.detallesInicialesCargados = true;
    this.detallesPagos.clear();
    detalles.forEach(detalle => {
      this.agregarFilaPago(false);
      this.detallesPagos.at(this.detallesPagos.length - 1).patchValue(detalle);
    });
    this.actualizarTotales();
  }

  private actualizarTiposPagoFiltrados() {
    if (!this.tiposPago || this.tiposPago.length === 0) {
      this.tiposPagoFiltrados = [];
      console.warn('tiposPago está vacío:', this.tiposPago);
      return;
    }
    this.tiposPagoFiltrados = this.tiposPago.filter(t =>
      t.iD_Tipo_Pagos !== this.ID_PAGO_MIXTO &&
      !t.descripcion_Tipo_Pagos?.toLowerCase().includes('crédito') &&
      !t.descripcion_Tipo_Pagos?.toLowerCase().includes('credito')
    );
    console.log('tiposPagoFiltrados actualizado:', this.tiposPagoFiltrados);
  }

  get detallesPagos(): FormArray {
    return this.form.get('detallesPagos') as FormArray;
  }

  /**
   * Agrega una nueva fila de pago
   */
  agregarFilaPago(emitirCambio: boolean = true) {
    if (this.detallesPagos.length >= 10) {
      console.warn('Máximo de 10 filas alcanzado');
      return;
    }
    const grupo = this.fb.group({
      ID_Tipo_Pago: [null, Validators.required],
      Monto_Pago: [0, [Validators.required, Validators.min(0.01)]],
      Numero_Referencia: [''],
      Observacion: ['']
    });
    this.detallesPagos.push(grupo);
    if (emitirCambio) {
      this.actualizarTotales();
    }
  }

  onMontoInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input?.value ?? '';
    const numericValue = rawValue === '' ? 0 : Number(rawValue);

    this.detallesPagos.at(index)?.patchValue({
      Monto_Pago: numericValue
    }, { emitEvent: false });

    console.log('DEBUG_MONTO_INPUT', {
      index,
      rawValue,
      numericValue,
      controlValue: this.detallesPagos.at(index)?.get('Monto_Pago')?.value,
      totalFactura: this.getTotalFacturaNumerico()
    });

    this.actualizarTotales();
  }

  onTipoPagoChange(index: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const rawValue = select?.value ?? '';
    const numericValue = rawValue === '' ? 0 : Number(rawValue);

    this.detallesPagos.at(index)?.patchValue({
      ID_Tipo_Pago: numericValue
    }, { emitEvent: false });

    console.log('DEBUG_TIPO_PAGO_CHANGE', {
      index,
      rawValue,
      numericValue,
      controlValue: this.detallesPagos.at(index)?.get('ID_Tipo_Pago')?.value,
      totalFactura: this.getTotalFacturaNumerico()
    });

    this.actualizarTotales();
  }

  /**
   * Elimina una fila de pago
   */
  eliminarFilaPago(index: number) {
    if (this.detallesPagos.length > 2) {
      this.detallesPagos.removeAt(index);
      this.actualizarTotales();
    }
  }

  /**
   * Actualiza los totales de pagos
   */
  actualizarTotales() {
    const pagos = this.detallesPagos.controls.map(control => {
      const montoRaw = Number(control.get('Monto_Pago')?.value ?? 0);
      const monto = Number.isFinite(montoRaw) ? this.normalizarMonto(montoRaw) : 0;
      return {
        ID_Tipo_Pago: Number(control.get('ID_Tipo_Pago')?.value ?? 0),
        Monto_Pago: monto,
        Numero_Referencia: control.get('Numero_Referencia')?.value ?? '',
        Observacion: control.get('Observacion')?.value ?? ''
      };
    });

    this.pagosTotales = pagos.reduce((suma, pago) => {
      const monto = Number.isFinite(pago.Monto_Pago) ? this.normalizarMonto(pago.Monto_Pago) : 0;
      return this.normalizarMonto(suma + monto);
    }, 0);

    const totalFactura = this.getTotalFacturaNumerico();
    this.saldoPendiente = this.normalizarMonto(totalFactura - this.pagosTotales);

    console.log('DEBUG_PAGO_MIXTO', {
      totalFactura,
      pagosTotales: this.pagosTotales,
      saldoPendiente: this.saldoPendiente,
      pagos,
      controles: this.detallesPagos.controls.map(c => ({
        id: c.get('ID_Tipo_Pago')?.value,
        monto: c.get('Monto_Pago')?.value,
        referencia: c.get('Numero_Referencia')?.value
      }))
    });

    this.pagosMixtoChange.emit(pagos);
  }

  /**
   * Valida si el formulario es válido
   */
  get esValido(): boolean {
    if (this.tipoPagoSeleccionado !== this.ID_PAGO_MIXTO) return true;
    const diferencia = Math.abs(this.saldoPendiente);
    return diferencia <= 0.01 && this.detallesPagos.valid;
  }

  /**
   * Obtiene los tipos de pago excluyendo MIXTO y los ya seleccionados en otras filas
   */
  getTiposPagoDisponibles(index: number): any[] {
    const seleccionados = this.detallesPagos.controls
      .filter((_, i) => i !== index)
      .map(c => Number(c.get('ID_Tipo_Pago')?.value))
      .filter(v => v > 0);

    return this.tiposPagoFiltrados.filter(t => !seleccionados.includes(t.iD_Tipo_Pagos));
  }

  /**
   * Obtiene los tipos de pago excluyendo MIXTO
   */
  getTiposPagoExcluendoMixto(): any[] {
    return this.tiposPagoFiltrados;
  }

  /**
   * Determina si la fila necesita campo de referencia (Tarjeta, Transferencia, Cheque)
   */
  requiereReferencia(index: number): boolean {
    const tipoPagoId = Number(this.detallesPagos.at(index)?.get('ID_Tipo_Pago')?.value);
    if (!tipoPagoId) return false;
    const tipo = this.tiposPago.find(t => t.iD_Tipo_Pagos === tipoPagoId);
    if (!tipo) return false;
    const desc = (tipo.descripcion_Tipo_Pagos || '').toLowerCase();
    return desc.includes('tarjeta') || desc.includes('transferencia') || desc.includes('cheque');
  }

  /**
   * Obtiene los índices del FormArray para usar en *ngFor
   */
  getIndices(): number[] {
    const length = this.detallesPagos.length;
    return Array.from({ length: length }, (_, i) => i);
  }
}
