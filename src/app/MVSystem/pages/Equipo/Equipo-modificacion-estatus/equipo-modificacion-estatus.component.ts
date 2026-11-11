import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CondicionEquipo, Desbloqueo } from 'src/app/core/interfaces/catalogo.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { EquipoModificarEstatus } from 'src/app/core/interfaces/equipo.interface';
import { FormValidatorService } from '../../../../services/form-validator.service';
import { LoginService } from 'src/app/auth/login.service';
import { UserTrackingService } from 'src/app/core/services/user-tracking.service';
import { LaptopsService } from 'src/app/core/services/laptops.service';
import { ModeloComponente } from 'src/app/core/interfaces/laptop.interface';
import { LaptopConfigEditorComponent } from '../laptop-config-editor/laptop-config-editor.component';

@Component({
  selector: 'app-equipo-modificacion-estatus',
  templateUrl: './equipo-modificacion-estatus.component.html',
  styleUrls: ['./equipo-modificacion-estatus.component.css']
})
export class EquipoModificacionEstatusComponent implements OnInit {
 usuario: string =  this.loginService.getUserName();
  equipoCondicionCatalogo: CondicionEquipo[] = [];
  equipoEstadosBloqueoCatalogo: Desbloqueo[] = [];
  imeiRegex  = new RegExp('^[0-9]+$');
  equipoImei: string = "";
  equipoModelo: string = "";
  toastrDefaultConfig: any = {progressBar: true, closeButton: true}

  // Laptops: solo para agregar la configuración a las que aún no la tienen; si ya la tienen, se muestra de solo lectura
  esLaptop = false;
  configuracionActual: string | null = null;
  modelosComponente: ModeloComponente[] = [];
  guardandoConfig = false;
  @ViewChild(LaptopConfigEditorComponent) editorConfig?: LaptopConfigEditorComponent;

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
              private loginService: LoginService,
              private tracking: UserTrackingService,
              private laptopsService: LaptopsService
             ) { }

  ngOnInit(): void {
    this.obtenerCondicionEquipoCatalogo();
    this.obtenerDesbloqueo();

    // 📊 Tracking: Registro de acceso al módulo
    this.tracking.trackPageView('MNU_MANT_ESTATUS_EQUIPOS', 'PageView').subscribe();
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

    // 📊 Tracking: Registro de modificación de estatus
    this.tracking.trackAction('MNU_MANT_ESTATUS_EQUIPOS', 'Modificar Estatus').subscribe();

    this.mantenimientoService.modificarEstatusEquipo(this.cambiarEstadoForm.value).subscribe(res => {
      this.toastr.success('Modificacion de estado del equipo exitosa', '',this.toastrDefaultConfig)
      window.location.reload();
    }, err => {
    })
  }

  obtenerEquipoByImei(){
    this.mantenimientoService.getEquipoByImei(this.cambiarEstadoForm.get('imei')?.value)
        .subscribe( res => {
          this.equipoImei = res.imei;
          this.equipoModelo = [res.marca, res.modelo].filter(x => !!x).join(" ");
          this.cargarDatosEquipoEnFormulario(res);
          this.consultarConfiguracionLaptop(res.imei);
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
  /** Identifica si el equipo es una laptop y si ya tiene configuración. */
  private consultarConfiguracionLaptop(imei: string) {
    this.esLaptop = false;
    this.configuracionActual = null;
    this.laptopsService.consultarEquipo(imei).subscribe({
      next: (equipos) => {
        const equipo = equipos && equipos.length ? equipos[0] : null;
        this.esLaptop = !!equipo?.es_Laptop;
        this.configuracionActual = equipo?.configuracion || null;
        if (this.esLaptop && !this.configuracionActual && !this.modelosComponente.length) {
          this.laptopsService.consultarModelosComponente().subscribe({
            next: (modelos) => this.modelosComponente = modelos || [],
            error: () => this.toastr.error('No se pudieron cargar los modelos de componentes.', '', this.toastrDefaultConfig)
          });
        }
      },
      error: () => { this.esLaptop = false; }
    });
  }

  guardarConfiguracionLaptop() {
    if (!this.esLaptop || this.configuracionActual || this.guardandoConfig || !this.editorConfig) { return; }
    const configuracion = this.editorConfig.armarConfiguracion(this.equipoImei, this.loginService.getUserName());
    if (!configuracion) {
      this.toastr.error('Complete la configuración: ' + this.editorConfig.error, '', this.toastrDefaultConfig);
      return;
    }
    this.guardandoConfig = true;
    this.laptopsService.guardarConfiguracion(configuracion).subscribe({
      next: (guardada) => {
        this.guardandoConfig = false;
        this.configuracionActual = (guardada && guardada.length ? guardada[0].configuracion : null) || 'Configuración guardada';
        this.toastr.success('Configuración de la laptop guardada.', '', this.toastrDefaultConfig);
      },
      error: (err) => {
        this.guardandoConfig = false;
        this.toastr.error('No se pudo guardar la configuración de la laptop.', '', this.toastrDefaultConfig);
        console.error('Error guardando configuración de laptop:', err);
      }
    });
  }

  /**
   * El IMEI se puede editar para buscar otro equipo sin refrescar. Al cambiarlo se descartan los datos del equipo
   * cargado (para no guardar sus precios en el IMEI nuevo) y hay que volver a buscar con Enter.
   */
  onImeiCambio() {
    const imeiEscrito = (this.cambiarEstadoForm.get('imei')?.value ?? '').toString().trim();
    if (!this.equipoImei || imeiEscrito === this.equipoImei) { return; }
    this.equipoImei = "";
    this.equipoModelo = "";
    this.esLaptop = false;
    this.configuracionActual = null;
    this.cambiarEstadoForm.patchValue({
      condicionId: null, costoEquipo: '', comisionDetalle: '', comisionMayor: '',
      precioPorMayor: '', precioDetalle: '', estadoBloqueoId: null
    });
    this.cambiarEstadoForm.markAsUntouched();
    this.cambiarEstadoForm.markAsPristine();
  }

  resetForm(){
    this.esLaptop = false;
    this.configuracionActual = null;
    this.equipoImei = "";
    this.equipoModelo = "";
    this.cambiarEstadoForm.reset();
  }

  validarCampos(campo :string){
    return this.cambiarEstadoForm.get(campo)?.errors
        && this.cambiarEstadoForm.get(campo)?.dirty
        && this.cambiarEstadoForm.get(campo)?.touched;
  }
}
