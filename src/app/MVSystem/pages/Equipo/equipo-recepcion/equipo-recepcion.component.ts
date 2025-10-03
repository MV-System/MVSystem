import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CondicionEquipo, ModeloEquipo } from 'src/app/core/interfaces/catalogo.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { FormValidatorService } from 'src/app/services/form-validator.service';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { EquipoEstadoUpdate } from '../../../../core/interfaces/equipo.interface';
import { EquipoService } from '../../../../core/services/equipo.service';
import { FormAsyncValidatorService } from 'src/app/services/form-async-validator.service';
import { LoginService } from 'src/app/auth/login.service';

@Component({
  selector: 'app-equipo-recepcion',
  templateUrl: './equipo-recepcion.component.html',
  styleUrls: ['./equipo-recepcion.component.css']
})
export class EquipoRecepcionComponent implements OnInit {
  equipoCondicionCatalogo: CondicionEquipo[] = [];
  modelosCatalogo: ModeloEquipo[] = [];
  imeiRegex  = new RegExp('^[0-9]+$');
  toastrDefaultConfig: any = {progressBar: true, closeButton: true}
  equipoEntraNoDisponible: boolean = false;
  equipoSaleDisponible: boolean = false;

  Usuario: string = this.loginService.getUserName();

  /**
   * Validador personalizado para teléfono con máscara
   * Valida que tenga exactamente 10 dígitos
   */
  telefonoValidator(control: any) {
    const value = control.value;
    if (!value) return null;

    // Remover caracteres no numéricos para validación
    const digitsOnly = value.replace(/\D/g, '');

    // Verificar que tenga exactamente 10 dígitos
    if (digitsOnly.length === 10) {
      return null; // Válido
    }

    return { invalidTelefono: true }; // Inválido
  }

  /**
   * Validador para cédula dominicana o pasaporte
   * Cédula: 11 dígitos con formato XXX-XXXXXXX-X
   * Pasaporte: Alfanumérico, mínimo 6 caracteres
   */
  cedulaOPasaporteValidator(control: any) {
    const value = control.value;
    if (!value) return null;

    // Remover caracteres no numéricos
    const digitsOnly = value.replace(/\D/g, '');

    // Si tiene 11 dígitos, es cédula dominicana válida
    if (digitsOnly.length === 11) {
      return null;
    }

    // Si no tiene 11 dígitos, validar como pasaporte (alfanumérico, min 6 caracteres)
    if (value.length >= 6 && /^[a-zA-Z0-9]+$/.test(value)) {
      return null;
    }

    return { invalidCedulaOPasaporte: true };
  }

  get precioImeiEntra(){return this.recepcionEquipoForm.get('PrecioImeiEntra');}
  get imeiEntra(){return this.recepcionEquipoForm.get('ImeiEntrada');}
  get imeiSale(){return this.recepcionEquipoForm.get('ImeiSale');}


  get mensajeErrorCampoPrecioImeiEntrada() {
    const errors = this.precioImeiEntra?.errors;
    if (errors?.required)
      return "Este campo es requerido."
    else if (errors?.percioMayorCero)
      return "Debe ser mayor a cero."
    else return ''
  }

  get nombresErrorMsg(): string {
    const errors = this.recepcionEquipoForm.get('Nombres')?.errors;
    if (errors?.required) return 'Este campo es requerido';
    if (errors?.minlength) return 'Debe tener al menos 2 caracteres';
    if (errors?.pattern) return 'No puede contener solo espacios';
    return '';
  }

  get apellidosErrorMsg(): string {
    const errors = this.recepcionEquipoForm.get('Apellidos')?.errors;
    if (errors?.required) return 'Este campo es requerido';
    if (errors?.minlength) return 'Debe tener al menos 2 caracteres';
    if (errors?.pattern) return 'No puede contener solo espacios';
    return '';
  }

  get cedulaErrorMsg(): string {
    const errors = this.recepcionEquipoForm.get('Cedula')?.errors;
    if (errors?.required) return 'Este campo es requerido';
    if (errors?.invalidCedulaOPasaporte) return 'Ingrese una cédula válida (11 dígitos) o pasaporte (mín. 6 caracteres alfanuméricos)';
    return '';
  }

  get telefonoErrorMsg(): string {
    const errors = this.recepcionEquipoForm.get('Telefono')?.errors;
    if (errors?.required) return 'Este campo es requerido';
    if (errors?.invalidTelefono) return 'Debe ingresar un número de teléfono válido de 10 dígitos';
    return '';
  }

  get imeiEntradaErrorMsg(): string {
    const errors = this.recepcionEquipoForm.get('ImeiEntrada')?.errors;
    if (errors?.required) return 'Este campo es requerido';
    if (errors?.maxlength) return 'Máximo 30 caracteres';
    if (errors?.pattern) return 'No puede contener espacios al inicio o final';
    return '';
  }

  get imeiSaleErrorMsg(): string {
    const errors = this.recepcionEquipoForm.get('ImeiSale')?.errors;
    if (errors?.maxlength) return 'Máximo 30 caracteres';
    if (errors?.pattern) return 'No puede contener espacios al inicio o final';
    return 'Debe validar que el IMEI existe y esté disponible';
  }

  recepcionEquipoForm = this.fb.group({
    Nombres: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^\S.*\S$|^\S$/)]],
    Apellidos: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^\S.*\S$|^\S$/)]],
    Cedula: ['', [Validators.required, this.cedulaOPasaporteValidator]],
    Telefono: ['', [Validators.required, this.telefonoValidator]],
    ImeiEntrada: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^\S.*\S$|^\S$/)]],
    PrecioImeiEntra: [,[Validators.required, this.formValidatorsService.validarPrecioMayorCero]],
    IDModelo: ['', Validators.required],
    IDCondicion: ['', Validators.required],
    ImeiSale: ['', [Validators.maxLength(30), Validators.pattern(/^\S.*\S$|^\S$/)], [this.imeiSaleAsyncValidatorService]],
    Nota: [''],
    Usuario: this.loginService.getUserName()
  })


  constructor(private fb: FormBuilder,
              private catalogosService: CatalogosService,
              private toastr: ToastrService,
              private mantenimientoService: MantenimientoService,
              private formValidatorsService: FormValidatorService,
              private loginService:LoginService,
              private equipoService: EquipoService,
              private imeiSaleAsyncValidatorService: FormAsyncValidatorService
             ) {
              this.Usuario = this.loginService.getUserName()
            }

  ngOnInit(): void {
    this.obtenerCondicionEquipoCatalogo();
    this.obtenerModeelosCatalogo();
  }


 async recibirEquipo(){
  if(this.recepcionEquipoForm.pending){
    return;
  }
  if(this.recepcionEquipoForm.invalid){
    this.recepcionEquipoForm.markAllAsTouched();
    this.markAllFormControlAsDirty();
    this.toastr.error('El formulario contiene datos incorrectos, favor validar', '', this.toastrDefaultConfig);
    return
  }

  let equipoEntraData = await this.consultaEquipoDisponible(this.imeiEntra?.value)
  let equipoSaleData = {imei: '', existe: false, disponible: false}
  if(this.imeiSale?.value){
    equipoSaleData = await this.consultaEquipoDisponible(this.imeiSale?.value)
    if(!equipoSaleData.existe || !equipoSaleData.disponible){
      this.toastr.error('Debe validar que el equipo que sale existe y este disponible', '', this.toastrDefaultConfig)
      return;
    }
  }

  this.mantenimientoService.recepcionEquipo(this.recepcionEquipoForm.value)
      .subscribe( res => {
        if(equipoEntraData.existe && !equipoEntraData.disponible){
          this.actualizarEstadoEquipo({Imei: this.imeiEntra?.value,Disponible: 'S', NotaAdicional: 'Recibido', Usuario: this.Usuario })
        }else if(!equipoEntraData.existe) {
          this.toastr.warning('Asegurese de registrar el equipo recibido','', this.toastrDefaultConfig )
        }
        if(this.imeiSale?.value){
          this.actualizarEstadoEquipo({Imei: equipoSaleData.imei,Disponible: 'N', NotaAdicional: 'Vendido', Usuario: this.Usuario })
        }
        this.resetForm();
        this.toastr.success('Se ha recibido el equipo')
      })
  }

  consultaEquipoDisponible(imei: string): Promise<{imei:string , existe: boolean, disponible: boolean}>{
    return new Promise( (resolve, reject) => {
      this.mantenimientoService.consultaEquipoDisponible(imei).subscribe( (res) => {
        if(res.imei != null)
          resolve({imei: res.imei, existe: true, disponible: res.imei.length > 0})
        else
          resolve({imei: '', existe: false, disponible: false})
      })
    })
  }



  actualizarEstadoEquipo(data: EquipoEstadoUpdate){
    this.mantenimientoService.equipoEstadoActualiza(data).subscribe( res =>{} , err => {
      console.log(err);
    })
  }


  obtenerCondicionEquipoCatalogo() {
    this.catalogosService.getCondicionEquipoLista()
      .subscribe(catalogoCondicionEquipo => {
        this.equipoCondicionCatalogo = catalogoCondicionEquipo;
      })
  }

  obtenerModeelosCatalogo() {
    this.catalogosService.getModeloLista()
      .subscribe(modeloLista => {
        this.modelosCatalogo = modeloLista;
      })
  }
  resetForm(){
    this.equipoEntraNoDisponible = false;
    this.equipoSaleDisponible = false;
    this.recepcionEquipoForm.reset();
  }

  validarCampos(campo :string){
    return this.recepcionEquipoForm.get(campo)?.errors
        && this.recepcionEquipoForm.get(campo)?.dirty
        && this.recepcionEquipoForm.get(campo)?.touched;
  }

  markAllFormControlAsDirty(){
    Object.keys(this.recepcionEquipoForm.controls).forEach( formcontrolname => {
      this.recepcionEquipoForm.get(formcontrolname)?.markAsDirty();
    })
  }


}
