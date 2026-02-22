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
  @Output() pagosMixtoChange = new EventEmitter<DetallePago[]>();
  @Output() tipoPagoChange = new EventEmitter<number>();

  form: FormGroup;
  pagosTotales: number = 0;
  saldoPendiente: number = 0;
  ID_PAGO_MIXTO = 6; // Constante para tipo Mixto
  Math = Math; // Para usar Math en el template
  private filasInicializadas = false;
  tiposPagoFiltrados: any[] = [];

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
      } else {
        // Limpiar si NO es mixto
        this.detallesPagos.clear();
        this.pagosTotales = 0;
        this.saldoPendiente = 0;
        this.pagosMixtoChange.emit([]);
        this.filasInicializadas = false;
      }
    }
  }

  private actualizarTiposPagoFiltrados() {
    if (!this.tiposPago || this.tiposPago.length === 0) {
      this.tiposPagoFiltrados = [];
      console.warn('tiposPago está vacío:', this.tiposPago);
      return;
    }
    this.tiposPagoFiltrados = this.tiposPago.filter(t => t.iD_Tipo_Pagos !== this.ID_PAGO_MIXTO);
    console.log('tiposPagoFiltrados actualizado:', this.tiposPagoFiltrados);
  }

  get detallesPagos(): FormArray {
    return this.form.get('detallesPagos') as FormArray;
  }

  /**
   * Agrega una nueva fila de pago
   */
  agregarFilaPago() {
    if (this.detallesPagos.length >= 10) {
      console.warn('Máximo de 10 filas alcanzado');
      return;
    }
    const grupo = this.fb.group({
      ID_Tipo_Pago: [null, Validators.required],
      Monto_Pago: [0, [Validators.required, Validators.min(0)]],
      Numero_Referencia: [''],
      Observacion: ['']
    });
    this.detallesPagos.push(grupo);
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
    this.pagosTotales = this.detallesPagos.controls
      .reduce((suma, control) => suma + (Number(control.get('Monto_Pago')?.value) || 0), 0);

    this.saldoPendiente = this.totalFactura - this.pagosTotales;

    // Emitir cambios
    const pagos = this.detallesPagos.getRawValue();
    this.pagosMixtoChange.emit(pagos);
  }

  /**
   * Valida si el formulario es válido
   */
  get esValido(): boolean {
    if (this.tipoPagoSeleccionado !== this.ID_PAGO_MIXTO) return true;
    return Math.abs(this.saldoPendiente) < 0.01 && this.detallesPagos.valid;
  }

  /**
   * Obtiene los tipos de pago excluyendo MIXTO
   */
  getTiposPagoExcluendoMixto(): any[] {
    return this.tiposPagoFiltrados;
  }

  /**
   * Obtiene los índices del FormArray para usar en *ngFor
   */
  getIndices(): number[] {
    const length = this.detallesPagos.length;
    // Si la inicialización no terminó correctamente y hay más de 2, limpiar y re-agregar
    if (this.tipoPagoSeleccionado === this.ID_PAGO_MIXTO && length > 2) {
      console.warn('FormArray tiene más elementos de lo esperado:', length);
      this.detallesPagos.clear();
      this.agregarFilaPago();
      this.agregarFilaPago();
      return [0, 1];
    }
    return Array.from({ length: length }, (_, i) => i);
  }
}
