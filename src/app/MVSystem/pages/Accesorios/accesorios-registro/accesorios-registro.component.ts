import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CatalogosService } from '../../../../core/services/catalogos.service';
import {
  Almacen,
  MarcaEquipo,
  ModeloEquipo,
} from '../../../../core/interfaces/catalogo.interface';
import { Accesorio, AccesorioLista, AccesorioCoincidencia, AccesorioSumarRespuesta } from '../../../../core/interfaces/mantenimiento';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { ToastrService } from 'ngx-toastr';
import * as $ from"jquery";
import { LoginService } from 'src/app/auth/login.service';
import { UserTrackingService } from 'src/app/core/services/user-tracking.service';

@Component({
  selector: 'app-accesorios',
  templateUrl: './accesorios-registro.component.html',
  styleUrls: ['./accesorios-registro.component.css'],
})
export class AccesoriosRegistroComponent implements OnInit {
  marcaListado: MarcaEquipo[] = [];
  costoMask: string = '';
  accesoriosLista:any;
  almacenListado: Almacen[] = [];
  modeloListado: ModeloEquipo[] = [];
  btnDisabled: boolean = true;
  AccesorioValorRetorno: AccesorioLista[]=[];
  AccesorioRegistrado!: number;

  // Accesorio que ya existe: lista para elegir a cual sumarle la cantidad
  mostrarCoincidencias = false;
  coincidencias: AccesorioCoincidencia[] = [];
  coincidenciaElegida: AccesorioCoincidencia | null = null;
  modeloPendiente: Accesorio | null = null;
  cantidadSumar: number | string = '';
  actualizarPrecios = false;
  sumando = false;


  constructor(
    private fb: FormBuilder,
    private catalogosService: CatalogosService,
    private mantenimientoService: MantenimientoService,
    private toastr: ToastrService,
    private loginService: LoginService,
    private tracking: UserTrackingService
  ) {}

  ngOnInit(): void {

    this.obtenerMarcasLista();
    this.obtenerAlmacenLista();
    this.btnDisable();
    this.formRegistro.get('modelo')?.disable();

    // Suscribirse a cambios para mostrar validaciones en tiempo real
    this.setupRealtimeValidations();

    // 📊 Tracking: Registro de acceso al módulo
    this.tracking.trackPageView('MNU_MANT_ACCESORIOS', 'PageView').subscribe();
  }

  /**
   * Configura validaciones en tiempo real
   * Los validadores personalizados se ejecutan automáticamente
   * y los mensajes visuales se muestran en el HTML
   */
  setupRealtimeValidations() {
    // Ya no necesitamos suscripciones para mostrar toastr
    // Los validadores se ejecutan automáticamente con cada cambio
  }
  //Forms
  formRegistro: FormGroup = this.fb.group({
    descripcion: ['', [Validators.required, Validators.minLength(3)]],
    cantidad: ['', Validators.required],
    costo: ['', Validators.required],
    alDetalle: ['', Validators.required],
    alPorMayor: ['', Validators.required],
    IMEI: ['', [Validators.maxLength(30), Validators.pattern(/^\S.*\S$|^\S$/)]],  // Alfanumérico, sin espacios al inicio/final
    cantidadMax: [''],  // Campo opcional, valor por defecto será 2
    cantidadMin: [''],  // Campo opcional, valor por defecto será 1
    marca: ['', Validators.required],
    modelo: ['', Validators.required],
    almacen: ['', Validators.required],  // Valor vacío inicial para forzar selección
    usuario: [''],

    fechaFacturacion:['',]
  }, {
    validators: [
      this.validadorCantidadMinMax(),
      this.validadorPrecioDetalleMayor(),
      this.validadorPrecioDetalleCosto(),
      this.validadorPrecioMayorCosto(),  // Precio por mayor no puede ser menor que costo
      this.validadorDescripcionComponente()  // Marca Componentes: la descripcion empieza con la capacidad
    ]
  });
  /**
 * If the form is valid, set the button to disabled, otherwise set it to enabled.
 * @returns The return value of the function is the value of the last statement executed.
 */
   btnDisable(){
    return this.formRegistro.valid  ? this.btnDisabled = false: this.btnDisabled = true;
  }
  selectoresMarcaModeloValidator() {

    this.formRegistro.get('modelo')?.setValue('');
    if (this.formRegistro.get('marca')?.value) {
      this.formRegistro.get('modelo')?.enable();
      this.obtenerModeloLista();
    }
    else{
      this.formRegistro.controls.modelo.disable();

    }
  }

  /**
   * Validador personalizado: Cantidad mínima no puede ser mayor que cantidad máxima
   */
  validadorCantidadMinMax() {
    return (formGroup: FormGroup) => {
      const cantMin = formGroup.get('cantidadMin')?.value;
      const cantMax = formGroup.get('cantidadMax')?.value;

      if (cantMin && cantMax && Number(cantMin) > Number(cantMax)) {
        return { cantidadMinMayorQueMax: true };
      }
      return null;
    };
  }

  /**
   * Validador personalizado: Precio por mayor debe ser menor que precio al detalle
   */
  validadorPrecioDetalleMayor() {
    return (formGroup: FormGroup) => {
      const alPorMayor = formGroup.get('alPorMayor')?.value;
      const alDetalle = formGroup.get('alDetalle')?.value;

      if (alPorMayor && alDetalle && Number(alPorMayor) > Number(alDetalle)) {
        return { precioMayorSuperaDetalle: true };
      }
      return null;
    };
  }

  /**
   * Validador personalizado: Precio al detalle no puede ser menor que el costo
   */
  validadorPrecioDetalleCosto() {
    return (formGroup: FormGroup) => {
      const alDetalle = formGroup.get('alDetalle')?.value;
      const costo = formGroup.get('costo')?.value;

      if (alDetalle && costo && Number(alDetalle) < Number(costo)) {
        return { precioDetalleMenorQueCosto: true };
      }
      return null;
    };
  }

  /**
   * Validador personalizado: Precio por mayor no puede ser menor que el costo
   */
  validadorPrecioMayorCosto() {
    return (formGroup: FormGroup) => {
      const alPorMayor = formGroup.get('alPorMayor')?.value;
      const costo = formGroup.get('costo')?.value;

      if (alPorMayor && costo && Number(alPorMayor) < Number(costo)) {
        return { precioMayorMenorQueCosto: true };
      }
      return null;
    };
  }

  /**
   * Validador personalizado: si la marca es Componentes (RAM / discos de laptops), la descripcion
   * debe empezar con la capacidad (8GB 3200, 256GB, 1TB) porque el cambio de pieza la lee de ahi.
   */
  validadorDescripcionComponente() {
    return (formGroup: FormGroup) => {
      const idMarca = formGroup.get('marca')?.value;
      const descripcion = String(formGroup.get('descripcion')?.value ?? '').trim();
      const marca = this.marcaListado.find(m => m.iD_Marca === idMarca);

      if (marca?.descripcion?.trim().toUpperCase() === 'COMPONENTES' && descripcion) {
        if (!/^\d+([.,]\d+)?\s*(GB|TB)\b/i.test(descripcion)) {
          return { descripcionComponenteSinCapacidad: true };
        }
        // La descripcion tambien debe indicar el tipo del componente (DDR3 / DDR4 / SSD NVMe...), para distinguirlo
        // de otros de la misma capacidad en cualquier pantalla donde solo se muestre la descripcion
        const faltan = this.palabrasTipoComponente(formGroup.get('modelo')?.value)
          .filter(p => !descripcion.toUpperCase().includes(p.toUpperCase()));
        if (faltan.length) {
          return { descripcionComponenteSinTipo: faltan.join(' ') };
        }
      }
      return null;
    };
  }

  /** Palabras que la descripcion de un componente debe llevar segun su modelo (ej. RAM DDR4 SODIMM -> DDR4). */
  private palabrasTipoComponente(idModelo: any): string[] {
    const modelo = (this.modeloListado.find(m => m.iD_Modelo === Number(idModelo))?.descripcion || '').toUpperCase();
    const ddr = modelo.match(/DDR[345]/);
    if (ddr) { return [ddr[0]]; }
    if (modelo.includes('NVME')) { return ['SSD', 'NVMe']; }
    if (modelo.includes('M.2')) { return ['SSD', 'M.2']; }
    if (modelo.includes('SSD')) { return ['SSD', '2.5']; }
    if (modelo.includes('HDD')) { return ['HDD']; }
    return [];
  }

  /** Mensaje del problema de la descripcion de un componente, o '' si esta bien. */
  get descripcionComponenteMensaje(): string {
    if (!this.formRegistro.get('descripcion')?.dirty) { return ''; }
    const errores = this.formRegistro.errors;
    if (errores?.['descripcionComponenteSinCapacidad']) {
      return 'Para la marca Componentes, la descripción debe empezar con la capacidad (ej. 16GB DDR4 3200, 256GB SSD NVMe, 1TB HDD 2.5).';
    }
    if (errores?.['descripcionComponenteSinTipo']) {
      return 'La descripción debe incluir el tipo del componente: ' + errores['descripcionComponenteSinTipo'] + ' (ej. 16GB DDR4 3200).';
    }
    return '';
  }

  obtenerMarcasLista() {
    this.catalogosService.getMarcasLista().subscribe((marca) => {
      this.marcaListado = marca;
    });
  }
  msgValidacionesCamposFormCantMaxCantMin() {
    const cantMin = this.formRegistro.get('cantidadMin')?.value;
    const cantMax = this.formRegistro.get('cantidadMax')?.value;

    // Solo validar si ambos campos tienen valor
    if (cantMin && cantMax && Number(cantMin) > Number(cantMax)) {
      this.formRegistro.setErrors({error:''})
      this.toastr.error(
        'La cantidad mínima no puede ser mayor a la cantidad máxima',
        '',
        { closeButton: true, progressBar: true }
      );
      return true;
    }
    return false;
  }
  msgValidacionesCamposFormDetallePorMayor() {
    if (
      this.formRegistro.get('alPorMayor')?.value >
      this.formRegistro.get('alDetalle')?.value
    ) {
      this.formRegistro.setErrors({error:''})
      this.toastr.error(
        'El monto al por mayor, debe ser menor que el monto Al detalle',
        '',
        { closeButton: true, progressBar: true }
      );
      return true;
    }
    return false;
  }
  //Al detalle no puede ser mayor que el costo
  validarCamposFormCostoDetalle() {

    if (
      this.formRegistro.get('alDetalle')?.value <
      this.formRegistro.get('costo')?.value  && this.formRegistro.get('costo')?.value !== null)
     {
      this.formRegistro.setErrors({error:''})
      this.toastr.error(
        'El monto de Al detalle no puede ser menor que el Costo',
        '',
        { closeButton: true, progressBar: true }
      );
      return true;
    }
    return false;
  }

  msgValidacionesCamposFormNumericos() {
    let camposNumerico: string[] = [
      'cantidad',
      'costo',
      'alDetalle',
      'alPorMayor',
    ];
    // Validar campos obligatorios
    for (const campo of camposNumerico) {
      const valor = this.formRegistro.get(campo)?.value;
      if (valor !== null && valor !== '' && (Number(valor) <= 0)) {
        this.formRegistro.setErrors({error:''})
        this.toastr.error('Los valores de los campos deben ser mayor a 0', '', {
          closeButton: true,
          progressBar: true,
        });
        return true;
      }
    }

    // Validar campos opcionales solo si tienen valor
    let camposOpcionales: string[] = ['cantidadMax', 'cantidadMin'];
    for (const campo of camposOpcionales) {
      const valor = this.formRegistro.get(campo)?.value;
      if (valor !== null && valor !== '' && valor !== undefined) {
        if (Number(valor) <= 0) {
          this.formRegistro.setErrors({error:''})
          this.toastr.error('Los valores de los campos deben ser mayor a 0', '', {
            closeButton: true,
            progressBar: true,
          });
          return true;
        }
      }
    }
    return false;
  }


  validacionesRegistro(): boolean {
    const error1 = this.msgValidacionesCamposFormCantMaxCantMin();
    const error2 = this.msgValidacionesCamposFormDetallePorMayor();
    const error3 = this.msgValidacionesCamposFormNumericos();
    const error4 = this.validarCamposFormCostoDetalle();

    return error1 || error2 || error3 || error4;
  }

  /**
   * Marca todos los campos del formulario como touched para mostrar errores de validación
   * Se llama cuando el usuario intenta guardar con el botón deshabilitado
   */
  marcarCamposComoTocados() {
    Object.keys(this.formRegistro.controls).forEach(field => {
      const control = this.formRegistro.get(field);
      control?.markAsTouched({ onlySelf: true });
      control?.markAsDirty({ onlySelf: true });
    });

    // Mostrar mensaje informativo
    this.toastr.info(
      'Por favor, complete todos los campos obligatorios correctamente',
      'Formulario incompleto',
      { closeButton: true, progressBar: true, timeOut: 4000 }
    );
  }

  /**
   * Intenta guardar el accesorio
   * Si el formulario está inválido, marca todos los campos como touched para mostrar errores
   */
  intentarGuardar() {
    // Si el formulario es inválido o tiene errores personalizados, marcar campos
    if (this.btnDisabled) {
      this.marcarCamposComoTocados();
      return;
    }

    // Si está válido, proceder con el registro normal
    this.registroAccesorio();
  }

  registroAccesorio() {
    // Primero ejecutar validaciones personalizadas
    const hasCustomErrors = this.validacionesRegistro();

    // Solo proceder si el formulario es válido Y no hay errores personalizados
    if (this.formRegistro.valid && !hasCustomErrors) {
      const model: Accesorio = this.modeloRegistroAccesorio();

      // Si ya existe un accesorio con el mismo modelo y descripcion en el almacen, no se registra de nuevo:
      // se le muestra la lista para que elija a cual sumarle la cantidad.
      this.mantenimientoService
        .getAccesorioCoincidencias(model.id_Modelo, model.descripcion_Accesorio, Number(model.id_Almacen))
        .subscribe({
          next: (coincidencias: AccesorioCoincidencia[]) => {
            if (coincidencias && coincidencias.length) {
              this.abrirCoincidencias(coincidencias, model);
            } else {
              this.guardarNuevoAccesorio(model);
            }
          },
          error: (error) => {
            console.error('Error al buscar accesorios existentes:', error);
            this.toastr.error('No se pudo verificar si el accesorio ya existe. Intente de nuevo.');
          }
        });
    }
  }

  private guardarNuevoAccesorio(model: Accesorio) {
    // 📊 Tracking: Registro de creación de accesorio
    this.tracking.trackAction('MNU_MANT_ACCESORIOS', 'Registro').subscribe();

    this.mantenimientoService.postAccesorio(model)
        .subscribe({
          next: (accesorio: AccesorioLista) => {
            this.AccesorioValorRetorno.push(accesorio);
            this.toastr.success('Accesorio registrado con exito!');
            this.formRegistro.reset({});
          },
          error: (error) => {
            console.error('Error al registrar accesorio:', error);
            // Opcionalmente mostrar un mensaje de error al usuario
            // this.toastr.error('Error al registrar el accesorio');
          }
        });
  }

  // ---- Accesorio que ya existe: sumarle la cantidad en lugar de registrarlo de nuevo ----
  abrirCoincidencias(coincidencias: AccesorioCoincidencia[], model: Accesorio) {
    this.coincidencias = coincidencias;
    this.modeloPendiente = model;
    // Si hay una sola y esta activa, ya viene elegida
    const activas = coincidencias.filter(c => c.estado === 'A');
    this.coincidenciaElegida = coincidencias.length === 1 && activas.length === 1 ? activas[0] : null;
    this.cantidadSumar = model.cantidad;
    this.actualizarPrecios = false;
    this.mostrarCoincidencias = true;
  }

  cerrarCoincidencias() {
    if (this.sumando) { return; }
    this.mostrarCoincidencias = false;
    this.coincidencias = [];
    this.coincidenciaElegida = null;
    this.modeloPendiente = null;
  }

  elegirCoincidencia(c: AccesorioCoincidencia) {
    if (c.estado === 'A') { this.coincidenciaElegida = c; }
  }

  get cantidadSumarValida(): boolean {
    const n = Number(this.cantidadSumar);
    return Number.isInteger(n) && n > 0 && n <= 9999;
  }

  get existenciaResultante(): number {
    return (this.coincidenciaElegida?.cantidad ?? 0) + Number(this.cantidadSumar);
  }

  sumarCantidadAlExistente() {
    if (!this.coincidenciaElegida || !this.modeloPendiente || !this.cantidadSumarValida || this.sumando) { return; }

    const m = this.modeloPendiente;
    const elegida = this.coincidenciaElegida;
    this.sumando = true;

    this.tracking.trackAction('MNU_MANT_ACCESORIOS', 'SumarCantidad').subscribe();

    this.mantenimientoService.postAccesorioSumarExistencia({
      idAccesorio: elegida.idAccesorio,
      cantidad: Number(this.cantidadSumar),
      usuario: this.loginService.getUserName(),
      actualizarPrecios: this.actualizarPrecios,
      costoEquipo: this.actualizarPrecios ? m.costo_Equipo : undefined,
      precioPorMayor: this.actualizarPrecios ? m.precio_Por_Mayor : undefined,
      precioDetalle: this.actualizarPrecios ? m.precio_Detalle : undefined,
    }).subscribe({
      next: (r: AccesorioSumarRespuesta) => {
        this.sumando = false;
        this.AccesorioValorRetorno.push({
          descripcion_Accesorio: elegida.descripcion,
          precio_Por_Mayor: this.actualizarPrecios ? m.precio_Por_Mayor : elegida.precioPorMayor,
          precio_Detalle: this.actualizarPrecios ? m.precio_Detalle : elegida.precioDetalle,
          cantidad: Number(this.cantidadSumar),
        });
        this.toastr.success(`Se sumó la cantidad al accesorio existente. Existencia actual: ${r?.cantidad}`);
        this.mostrarCoincidencias = false;
        this.coincidencias = [];
        this.coincidenciaElegida = null;
        this.modeloPendiente = null;
        this.formRegistro.reset({});
      },
      error: (error) => {
        this.sumando = false;
        console.error('Error al sumar la cantidad al accesorio:', error);
        this.toastr.error(typeof error?.error === 'string' ? error.error : 'No se pudo sumar la cantidad.');
      }
    });
  }
  modeloRegistroAccesorio() {
    const accesorioModel: Accesorio = {
      // codigo: this.formRegistro.get('IMEI')?.value,
      descripcion_Accesorio: this.formRegistro.get('descripcion')?.value,
      cantidad:Number(  this.formRegistro.get('cantidad')?.value),
      costo_Equipo: Number(this.formRegistro.get('costo')?.value),
      precio_Detalle:Number( this.formRegistro.get('alDetalle')?.value),
      precio_Por_Mayor:Number(  this.formRegistro.get('alPorMayor')?.value),
      imei_Equipo: this.formRegistro.get('IMEI')?.value?.trim() || '',  // Trim para eliminar espacios
      can_Max: this.formRegistro.get('cantidadMax')?.value ? Number(this.formRegistro.get('cantidadMax')?.value) : 2,
      can_Min: this.formRegistro.get('cantidadMin')?.value ? Number(this.formRegistro.get('cantidadMin')?.value) : 1,
      id_Modelo:Number( this.formRegistro.get('modelo')?.value),
      id_Almacen: this.formRegistro.get('almacen')?.value,
      // cod_Barra:this.formRegistro.get('IMEI')?.value, //? preguntar //
      // disponible: this.formRegistro.get('IMEI')?.value,
      // disponible_Detalle: this.formRegistro.get('IMEI')?.value,
      usuario: this.loginService.getUserName(),
      // usuario: this.formRegistro.get('fechaFacturacion')?.value,
      disponible: 'S',
    };
    return accesorioModel;
  }
  validarCampos(nombreCampo: string) {
    return (
      this.formRegistro.get(nombreCampo)?.invalid &&
      this.formRegistro.get(nombreCampo)?.touched
    );
  }


  obtenerAlmacenLista() {
    this.catalogosService.getAlmaceLista().subscribe((almacen) => {
      this.almacenListado = almacen;
    });
  }
  obtenerModeloLista() {
    let idMarca = this.formRegistro.get('marca')?.value;
    this.catalogosService.getModeloByMarcaLista(idMarca).subscribe((modelo) => {
      this.modeloListado = modelo;
    });
  }

  /**
   * Clear the form and reset all values
   */
  limpiarFormulario() {
    this.formRegistro.reset({
      almacen: '', // Reset a valor vacío para forzar selección
      descripcion: '',
      cantidad: '',
      costo: '',
      alDetalle: '',
      alPorMayor: '',
      IMEI: '',
      cantidadMax: '',
      cantidadMin: '',
      marca: '',
      modelo: ''
    });

    // Resetear estado de validación
    this.formRegistro.markAsPristine();
    this.formRegistro.markAsUntouched();

    // Disable modelo field again
    this.formRegistro.get('modelo')?.disable();

    // Clear modelo list
    this.modeloListado = [];

    this.toastr.info('Formulario limpiado correctamente', 'Información');
  }}
