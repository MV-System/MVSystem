import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CatalogosService } from '../../../../core/services/catalogos.service';
import {
  Almacen,
  MarcaEquipo,
  ModeloEquipo,
} from '../../../../core/interfaces/catalogo.interface';
import { Accesorio, AccesorioLista} from '../../../../core/interfaces/mantenimiento';
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
    this.tracking.trackPageView('Registro Accesorios', {
      seccion: 'registro',
      vista: 'formulario'
    }).subscribe();
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
      this.validadorPrecioMayorCosto()  // Precio por mayor no puede ser menor que costo
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

      // 📊 Tracking: Registro de creación de accesorio
      this.tracking.trackAction('Registro Accesorios', 'Crear', {
        descripcion: model.descripcion_Accesorio,
        cantidad: model.cantidad
      }).subscribe();

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
