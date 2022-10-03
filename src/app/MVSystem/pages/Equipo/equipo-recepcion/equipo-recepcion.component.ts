import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CondicionEquipo, ModeloEquipo } from 'src/app/MVSystem/interfaces/catalogo.interface';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { FormValidatorService } from 'src/app/MVSystem/services/form-validator.service';
import { MantenimientoService } from 'src/app/MVSystem/services/mantenimiento.service';
import { EquipoEstadoUpdate } from '../../../interfaces/equipo.interface';
import { LoginService } from '../../../../services/login.service';

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
    ImeiSale: [''],
    Nota: ['']
  })


  constructor(private fb: FormBuilder,
              private catalogosService: CatalogosService,
              private toastr: ToastrService,
              private mantenimientoService: MantenimientoService,
              private formValidatorsService: FormValidatorService,
              private loginService:LoginService
             ) {
              this.userName = this.loginService.getUserName()
            }

  ngOnInit(): void {
    this.obtenerCondicionEquipoCatalogo();
    this.obtenerModeelosCatalogo();
  }


 async recibirEquipo(){
  if(this.recepcionEquipoForm.invalid){
    this.recepcionEquipoForm.markAllAsTouched();
    this.markAllFormControlAsDirty();
    this.toastr.error('El formulario contiene datos incorrectos, favor validar', '', this.toastrDefaultConfig);
    return 
  }

  let entranteDisponible = await this.consultaEquipoEntraDisponible();
  if(!this.equipoEntraNoDisponible)
  {
    this.toastr.error('Validar que el equipo entrante existe y no este disponible', '', this.toastrDefaultConfig);
    return;
  }

  let salienteDisponible = await this.consultaEquipoEntraDisponible();
  if(!this.equipoSaleDisponible)
  {
    this.toastr.error('Validar que el equipo que sale existe y esta disponible', '', this.toastrDefaultConfig);
    return;
  }

  this.mantenimientoService.recepcionEquipo(this.recepcionEquipoForm.value)
      .subscribe( res => {
        this.actualizarEstadoEquipo({Imei: this.imeiEntra?.value, Disponible: 'S', NotaAdicional:'Intercambiado entrante', Usuario: this.userName})
        this.actualizarEstadoEquipo({Imei: this.imeiSale?.value, Disponible: 'N', NotaAdicional:'Intercambiado saliente', Usuario: this.userName})
        this.resetForm();
        this.toastr.success('Se ha recibido el equipo')
      })
  }

  consultaEquipoEntraDisponible(): Promise<boolean>{
    return new Promise( resolve => {
      this.mantenimientoService.buscarEquipoDisponible(this.imeiEntra?.value,'2').subscribe( ({disponible}) => {
        resolve(disponible == 'N')
      })
    }) 
  }

  consultaEquipoSaleDisponible(): Promise<boolean>{
    return new Promise( resolve => {
        this.mantenimientoService.buscarEquipoDisponible(this.imeiSale?.value,'2').subscribe( ({disponible}) => {
        resolve(disponible == 'S')
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
