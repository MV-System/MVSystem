import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CondicionEquipo, Desbloqueo } from 'src/app/core/interfaces/catalogo.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { EquipoModificarEstatus } from 'src/app/core/interfaces/equipo.interface';
import { FormValidatorService } from '../../../../services/form-validator.service';
import { LoginService } from 'src/app/auth/login.service';

@Component({
  selector: 'app-equipo-modificacion-estatus',
  templateUrl: './equipo-modificacion-estatus.component.html',
  styleUrls: ['./equipo-modificacion-estatus.component.css']
})
export class EquipoModificacionEstatusComponent implements OnInit {

  equipoCondicionCatalogo: CondicionEquipo[] = [];
  equipoEstadosBloqueoCatalogo: Desbloqueo[] = [];
  imeiRegex  = new RegExp('^[0-9]+$');
  equipoImei: string = "";
  toastrDefaultConfig: any = {progressBar: true, closeButton: true}

  get existeEquipo(){return this.equipoImei;}
  get campoCosto(){return this.cambiarEstadoForm.get('costoEquipo');}
  get campoPrecioMayor(){return this.cambiarEstadoForm.get('precioPorMayor');}
  get campoPrecioDetalle(){return this.cambiarEstadoForm.get('precioDetalle');}
  get campoComisionDetalle(){return this.cambiarEstadoForm.get('comisionDetalle');}
  get campoComisionMayor(){return this.cambiarEstadoForm.get('comisionMayor');}


  get mensajeErrorCampoCosto() {
    const errors = this.campoCosto?.errors;
    if (errors?.required)
      return "Este campo es requerido."
    else if (errors?.percioMayorCero)
      return "Debe ser mayor a cero."
    else return ''
  }

  get mensajeErrorCampoPrecioMayor() {
    const errors = this.campoPrecioMayor?.errors;
    if (errors?.required)
      return "Este campo es requerido."
    else if (errors?.percioMayorCero)
      return "Debe ser mayor a cero."
    else if (errors?.ajustarPrecios == true)
      return "No puede ser menor al costo"
    else return ''
  }

  get mensajeErrorCampoPrecioDetalle(){
    const errors = this.campoPrecioDetalle?.errors;
    if(errors?.required)
     return "Este campo es requerido."
     else if(errors?.percioMayorCero)
     return "Debe ser mayor a cero."
    else if(errors?.ajustarPrecios == true)
     return "No puede ser menor al precio por mayor"
    else return ''
  }


  constructor(private fb: FormBuilder,
              private catalogosService: CatalogosService,
              private toastr: ToastrService,
              private mantenimientoService: MantenimientoService,
              private formValidatorsService: FormValidatorService,
              private loginService: LoginService
             ) { }

  ngOnInit(): void {
    this.obtenerCondicionEquipoCatalogo();
    this.obtenerDesbloqueo();
  }

  cambiarEstadoForm = this.fb.group({
      imei: ['', Validators.required],
      condicionId: [, Validators.required],
      costoEquipo: ['', [Validators.required, this.formValidatorsService.validarPrecioMayorCero]],
      comisionDetalle: [''],
      comisionMayor: [''],
      precioPorMayor: ['', [Validators.required, this.formValidatorsService.validarPrecioMayorCero]],
      precioDetalle: ['', [Validators.required, this.formValidatorsService.validarPrecioMayorCero]],
      estadoBloqueoId: [, Validators.required],
      Usuario:[this.loginService.getUserName()]
  }, {
    validators: [
                  this.formValidatorsService.validarPrecio('costoEquipo', 'precioPorMayor'),
                  this.formValidatorsService.validarPrecio('precioPorMayor', 'precioDetalle'),
                ]
  })


  cambiarEstatus(){
    if(this.cambiarEstadoForm.invalid){
      this.toastr.error('El formulario contiene datos incorrecto, favor validar', '', this.toastrDefaultConfig)
      return;
    }
    this.campoComisionDetalle?.setValue(this.campoComisionDetalle.value??0.00)
    this.campoComisionMayor?.setValue(this.campoComisionMayor.value??0.00)

    this.mantenimientoService.modificarEstatusEquipo(this.cambiarEstadoForm.value).subscribe(res => {
      this.toastr.success('Modificacion de estado del equipo exitosa', '',this.toastrDefaultConfig)
      this.resetForm();
    }, err => {
      console.log(err);
    })
  }

  obtenerEquipoByImei(){
    this.mantenimientoService.getEquipoByImei(this.cambiarEstadoForm.get('imei')?.value)
        .subscribe( res => {
          this.equipoImei = res.imei;
          this.cargarDatosEquipoEnFormulario(res);
        }, err => {
          this.toastr.error('Este Equipo no esta disponible, favor verifique que este registrado y que no este vendido.', '', this.toastrDefaultConfig)
        })
  }


  cargarDatosEquipoEnFormulario(equipo: EquipoModificarEstatus){
    this.cambiarEstadoForm.get('imei')?.setValue(equipo.imei);
    this.cambiarEstadoForm.get('condicionId')?.setValue(equipo.condicionId);
    this.cambiarEstadoForm.get('costoEquipo')?.setValue(equipo.costoEquipo);
    this.cambiarEstadoForm.get('comisionDetalle')?.setValue(equipo.comisionDetalle);
    this.cambiarEstadoForm.get('comisionMayor')?.setValue(equipo.comisionMayor);
    this.cambiarEstadoForm.get('precioPorMayor')?.setValue(equipo.precioPorMayor);
    this.cambiarEstadoForm.get('precioDetalle')?.setValue(equipo.precioDetalle);
    this.cambiarEstadoForm.get('estadoBloqueoId')?.setValue(equipo.estadoBloqueoId);
  }

  obtenerCondicionEquipoCatalogo() {
    this.catalogosService.getCondicionEquipoLista()
      .subscribe(catalogoCondicionEquipo => {
        this.equipoCondicionCatalogo = catalogoCondicionEquipo;
      })
  }

  obtenerDesbloqueo() {
    this.catalogosService.getDesbloqueoLista()
      .subscribe(estadosBloqueoCatalogo => {
        this.equipoEstadosBloqueoCatalogo = estadosBloqueoCatalogo;
      })
  }
  resetForm(){
    this.equipoImei = "";
    this.cambiarEstadoForm.reset();
  }

  validarCampos(campo :string){
    return this.cambiarEstadoForm.get(campo)?.errors
        && this.cambiarEstadoForm.get(campo)?.dirty
        && this.cambiarEstadoForm.get(campo)?.touched;
  }
}
