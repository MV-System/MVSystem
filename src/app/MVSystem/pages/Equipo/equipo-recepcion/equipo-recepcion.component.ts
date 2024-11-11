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

  userName: string = '';

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

  recepcionEquipoForm = this.fb.group({
    Nombres: ['', Validators.required],
    Apellidos: ['', Validators.required],
    Cedula: ['', Validators.required],
    Telefono: ['', Validators.required],
    ImeiEntrada: ['', Validators.required],
    PrecioImeiEntra: [,[Validators.required, this.formValidatorsService.validarPrecioMayorCero]],
    IDModelo: ['', Validators.required],
    IDCondicion: ['', Validators.required],
    ImeiSale: ['',[],[this.imeiSaleAsyncValidatorService]],//this.imeiSaleAsyncValidatorService
    Nota: ['']
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
              this.userName = this.loginService.getUserName()
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
          this.actualizarEstadoEquipo({Imei: this.imeiEntra?.value,Disponible: 'S', NotaAdicional: 'Recibido', Usuario: this.userName })
        }else if(!equipoEntraData.existe) {
          this.toastr.warning('Asegurese de registrar el equipo recibido','', this.toastrDefaultConfig )
        }
        if(this.imeiSale?.value){
          this.actualizarEstadoEquipo({Imei: equipoSaleData.imei,Disponible: 'N', NotaAdicional: 'Vendido', Usuario: this.userName })
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
