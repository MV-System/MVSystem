import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CondicionEquipo, Desbloqueo } from 'src/app/MVSystem/interfaces/catalogo.interface';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { MantenimientoService } from 'src/app/MVSystem/services/mantenimiento.service';
import { EquipoModificarEstatus } from 'src/app/MVSystem/interfaces/equipo.interface';

@Component({
  selector: 'app-equipo-modificacion-estatus',
  templateUrl: './equipo-modificacion-estatus.component.html',
  styleUrls: ['./equipo-modificacion-estatus.component.css']
})
export class EquipoModificacionEstatusComponent implements OnInit {

  equipoCondicionCatalogo: CondicionEquipo[] = [];
  equipoEstadosBloqueoCatalogo: Desbloqueo[] = [];
  equipoImei: string = ""; 
  decimalPattern: string = "^[+]?([0-9]+\.?[0-9]*|\.[0-9]+)$"

  get existeEquipo(){
    return this.equipoImei;
  } 



  constructor(private fb: FormBuilder,
              private catalogosService: CatalogosService,
              private toastr: ToastrService,
              private mantenimientoService: MantenimientoService
             ) { }


   

  ngOnInit(): void {
    this.obtenerCondicionEquipoCatalogo();
    this.obtenerDesbloqueo();
  }


  cambiarEstadoForm = this.fb.group({
      imei: ['', Validators.required],
      condicionId: [, Validators.required],
      costoEquipo: ['', Validators.required],
      comisionDetalle: ['', Validators.required],
      comisionMayor: ['', Validators.required],
      precioPorMayor: ['', Validators.required],
      precioDetalle: ['', Validators.required],
      estadoBloqueoId: [, Validators.required]
  })


  cambiarEstatus(){
    this.mantenimientoService.modificarEstatusEquipo(this.cambiarEstadoForm.value).subscribe(res => {
      console.log(res);
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
          console.log(err);
        })
  }


  cargarDatosEquipoEnFormulario(equipo: EquipoModificarEstatus){
    this.cambiarEstadoForm.get('imei')?.setValue(equipo.imei);
    this.cambiarEstadoForm.get('condicionId')?.setValue(equipo.condicionId);
    this.cambiarEstadoForm.get('costoEquipo')?.setValue(equipo.costoEquipo);
    this.cambiarEstadoForm.get('comisionDetalle')?.setValue(equipo.precioPorMayor);
    this.cambiarEstadoForm.get('comisionMayor')?.setValue(equipo.precioDetalle);
    this.cambiarEstadoForm.get('precioPorMayor')?.setValue(equipo.comisionMayor);
    this.cambiarEstadoForm.get('precioDetalle')?.setValue(equipo.comisionDetalle);
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
    return false;
  }

}
