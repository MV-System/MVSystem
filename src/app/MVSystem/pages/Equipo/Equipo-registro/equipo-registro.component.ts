import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Almacen, Desbloqueo, Garantia, MarcaEquipo, ModeloEquipo, Tecnologia } from 'src/app/MVSystem/interfaces/catalogo.interface';
import { CatalogosService } from '../../../services/catalogos.service';
import { CondicionEquipo, Suplidor } from '../../../interfaces/catalogo.interface';
import { ToastrService } from 'ngx-toastr';
import { Equipo, EquipoObjRetorno } from 'src/app/MVSystem/interfaces/mantenimiento';
import { MantenimientoService } from 'src/app/MVSystem/services/mantenimiento.service';

@Component({
  selector: 'app-equipo',
  templateUrl: './equipo-registro.component.html',
  styleUrls: ['./equipo-registro.component.css']
})
export class EquipoRegistroComponent implements OnInit {
  listaGarantia: Garantia[]=[];
  listaDesbloqueo: Desbloqueo[]=[];
  listaCondicionEquipo: CondicionEquipo[]=[];
  listaTecnologia: Tecnologia[]=[];
  listaSuplidor:Suplidor[]=[];
  listaMarca:   MarcaEquipo[]=[];
  listaAlmacen: Almacen[]=[];
  listaModelo:  ModeloEquipo[]=[];
  equipoValorRetorno: any[]=[];
  listaEquipoRegistrados: any[]=[];
  constructor(
    private fb: FormBuilder,
    private catalogosService: CatalogosService,
    private toastr: ToastrService,
    private mantenimientoService: MantenimientoService
  ) { }

  ngOnInit(): void {
    this.obtenerGarantia();
    this.obtenerDesbloqueo();
    this.obtenerCondicionEquipo();
    this.obtenerTecnologia();
    this.obtenerSuplidor();
    this.obtenerMarcasLista();
    this.obtenerAlmacenLista();

    this.formRegistro.controls.garantia.disable();
    this.formRegistro.controls.desbloqueado.disable();
    this.formRegistro.controls.modelo.disable();

  }

  btnDisabled: boolean = true;

  formRegistro: FormGroup = this.fb.group({
  factura:[,],
  IMEI:[,],
  costo:[,],
  alDetalle:[,],
  alPorMayor:[,],
  comisionDetalle:[,],
  comisionMayor:[,],
  nota:[,],
  idCondicion:[1,],
  idEstadoBloqueo:[1,],
  disponibleDetalle:[,],
  tecnologia:[,],
  garantia:[8,],
  desbloqueado:['S',],
  estado:[,],
  almacen:[2,],
  marca:[,],
  modelo:[,],
  suplidor:[,],
  disponible:['S',],
  numeroRegistro:[,],
  usuario:['xavier',]
  })

  registroEquipos(){
    const model: Equipo =this.modeloRegistroEquipo();
    this.validacionesRegistro()
    if ( this.formRegistro.valid   ) {
        console.log(model);
        // this.listaEquipoRegistrados.push(model);
        // console.log( this.listaEquipoRegistrados);

        this.mantenimientoService.postEquipo(model)
                                .subscribe((equipo) =>{
                                  equipo.forEach((element: any) => {
                                    
                                    this.equipoValorRetorno.push(element);
                                  });
                                  console.log( this.equipoValorRetorno );

                                  this.toastr.success('Equipo registrado con exito!')
                                });
      }

  }
  validacionesRegistro(){
    this.validarCamposFormCostoDetalle();
    this.msgValidacionesCamposFormComisionDetallePorMayor();
    this.msgValidacionesCamposFormDetallePorMayor();
    this.msgValidacionesCamposFormNumericos();

  }
  modeloRegistroEquipo(){
    const model: Equipo ={
      Imei: this.formRegistro.get('IMEI')?.value,
      ID_Modelo: Number( this.formRegistro.get('modelo')?.value),
      ID_Tecnologia: Number( this.formRegistro.get('tecnologia')?.value),
      ID_Garantia: Number( this.formRegistro.get('garantia')?.value),
      ID_Condicion: Number( this.formRegistro.get('idCondicion')?.value),
      ID_Estado_Bloqueo: Number( this.formRegistro.get('idEstadoBloqueo')?.value),
      ID_Almacen: Number( this.formRegistro.get('almacen')?.value),
      ID_Suplidor: Number( this.formRegistro.get('suplidor')?.value),
      Numero_de_Factura: this.formRegistro.get('factura')?.value,
      Precio_Por_Mayor: Number( this.formRegistro.get('alPorMayor')?.value),
      Precio_Detalle: Number( this.formRegistro.get('alDetalle')?.value),
      Costo_Equipo: Number( this.formRegistro.get('costo')?.value),
      Desbloqueado: this.formRegistro.get('desbloqueado')?.value,
      Disponible: this.formRegistro.get('disponible')?.value,
      Disponible_Detalle: this.formRegistro.get('disponibleDetalle')?.value,
      Usuario: this.formRegistro.get('usuario')?.value,
      Numero_Registro:Number( this.formRegistro.get('numeroRegistro')?.value),
      Comision_Por_Mayor: Number( this.formRegistro.get('comisionMayor')?.value),
      Comision_Detalle: Number( this.formRegistro.get('comisionDetalle')?.value)
    }
    return model;
  }
  msgValidacionesCamposFormComisionDetallePorMayor() {
    if (
      this.formRegistro.get('comisionMayor')?.value >
      this.formRegistro.get('comisionDetalle')?.value
    ) {
      this.formRegistro.setErrors({error:''})
      this.toastr.error(
        'La comision al por mayor no puede ser mayor a la comision al detalle',
        '',
        { closeButton: true, progressBar: true }
      );
      return;
    }
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
      return;
    }
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
      return;
    }
  }
  msgValidacionesCamposFormNumericos() {
    let camposNumerico: string[] = [
      'cantidad',
      'costo',
      'alDetalle',
      'alPorMayor',
      'comisionDetalle',
      'comisionMayor',
    ];
    camposNumerico.forEach((campo) => {
      if (
        this.formRegistro.get(campo)?.value < 0 ||
        this.formRegistro.get(campo)?.value == 0
      ) {
      this.formRegistro.setErrors({error:''})
      this.toastr.error('Los valores de los campos deben ser mayor a 0', '', {
          closeButton: true,
          progressBar: true,
        });
        return;
      }
    });
  }
  btnDisable(){
    return this.formRegistro.valid  ? this.btnDisabled = false: this.btnDisabled = true;
  }
  /**
 * If the checkbox is checked, enable the input field. If the checkbox is unchecked, disable the input
 * field and clear the value
 * @param {any} event - any
 */
   onCheckboxChange(event: any, campo: string) {

    if (event.target.checked == false) {
      this.formRegistro.controls[campo].disable();
      this.formRegistro.get(campo)?.setValue('');
    } else {
      this.formRegistro.controls[campo].enable();
    }
  }
  /**
 * It returns true if the form control is invalid and has been touched.
 * @param {string} nombreCampo - string
 * @returns a boolean value.
 */
   validarCampos(nombreCampo: string) {
    return (
      this.formRegistro.get(nombreCampo)?.invalid &&
      this.formRegistro.get(nombreCampo)?.touched
    );
  }

  selectoresMarcaModeloValidator() {
    if (this.formRegistro.get('marca')?.valid) {
      this.formRegistro.controls.modelo.enable();

      this.obtenerModeloLista();
    }
  }

  //Catalogos


  obtenerGarantia(){
  this.catalogosService.getGarantiaLista()
                      .subscribe(garantia=>{
                        this.listaGarantia = garantia;
                      })
  }
  obtenerDesbloqueo(){
    this.catalogosService.getDesbloqueoLista()
                        .subscribe(desbloqueo=>{
                          this.listaDesbloqueo = desbloqueo;
                        })
  }
  obtenerCondicionEquipo(){
    this.catalogosService.getCondicionEquipoLista()
                        .subscribe(condicionEquipo=>{
                          this.listaCondicionEquipo = condicionEquipo;
                        })
  }
  obtenerTecnologia(){
    this.catalogosService.getTecnologiaLista()
                        .subscribe(tecnologia=>{
                          this.listaTecnologia = tecnologia;
                        })
  }
  obtenerSuplidor(){
    this.catalogosService.getSuplidorLista()
                        .subscribe(suplidor=>{
                          this.listaSuplidor = suplidor;
                        })
  }
  obtenerMarcasLista() {
    this.catalogosService.getMarcasLista().subscribe((marca) => {
      this.listaMarca = marca;
    });
  }
  obtenerAlmacenLista() {
    this.catalogosService.getAlmaceLista().subscribe((almacen) => {
      this.listaAlmacen = almacen;
    });
  }
  obtenerModeloLista() {
    let idMarca = this.formRegistro.get('marca')?.value;
    this.catalogosService.getModeloLista(idMarca).subscribe((modelo) => {
      this.listaModelo = modelo;
    });
  }
}
