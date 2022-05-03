import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CatalogosService } from '../../../services/catalogos.service';
import { MarcaEquipo } from '../../../interfaces/catalogo.interface';
import { Accesorio } from '../../../interfaces/mantenimiento';
import { MantenimientoService } from 'src/app/MVSystem/services/mantenimiento.service';

@Component({
  selector: 'app-accesorios',
  templateUrl: './accesorios.component.html',
  styleUrls: ['./accesorios.component.css']
})
export class AccesoriosComponent implements OnInit {
  marcaListado: MarcaEquipo[]=[];
  costoMask: string = "";
  accesoriosLista: Accesorio[]=[];

  constructor(private fb: FormBuilder,
              private catalogosService: CatalogosService,
              private mantenimientoService: MantenimientoService) { }

  ngOnInit(): void {
    this.obtenerMarcasLista();
    this.validarCostoMask();
  }
//Forms
formRegistro: FormGroup = this.fb.group({
  descripcion:       ['Cover IPhone 13 Pro', [Validators.required]],
  cantidad:     [10, Validators.required],
  costo:  [,Validators.required],
  alDetalle:  [,Validators.required],
  alPorMayor:[,Validators.required],
  IMEI: [,Validators.required],
  cantidadMax:     [,Validators.required],
  cantidadMin: [,Validators.required] ,
  marca: [,Validators.required], 
  modelo: [,Validators.required], 
  almacen: [,Validators.required], 
  usuario: [,Validators.required], 
});

  registroAccesorio(){
    this.formRegistro.markAllAsTouched();

    const model: Accesorio = this.modeloRegistroAccesorio();
    if (this.formRegistro.valid) {
    // this.mantenimientoService.postAccesorio(model)
    //                         .subscribe(accesorio =>{
    //                           console.log(accesorio);
                              
    //                         });
    }
    this.accesoriosLista.push(model);
    console.log(this.accesoriosLista);
    
  }
  modeloRegistroAccesorio(){

    const accesorioModel: Accesorio ={
      // codigo: this.formRegistro.get('IMEI')?.value,
      descripcion_Accesorio: this.formRegistro.get('descripcion')?.value,
      cantidad:this.formRegistro.get('cantidad')?.value,
      costo_Equipo:this.formRegistro.get('costo')?.value,
      precio_Detalle:this.formRegistro.get('alDetalle')?.value,
      precio_Por_Mayor:this.formRegistro.get('alPorMayor')?.value,
      imei_Equipo: this.formRegistro.get('IMEI')?.value,
      can_Max:this.formRegistro.get('cantidadMax')?.value,
      can_Min:this.formRegistro.get('cantidadMin')?.value,
      id_Modelo: this.formRegistro.get('modelo')?.value,
      id_Almacen:this.formRegistro.get('almacen')?.value,
      // cod_Barra:this.formRegistro.get('IMEI')?.value, //? preguntar //
      // disponible: this.formRegistro.get('IMEI')?.value,
      // disponible_Detalle: this.formRegistro.get('IMEI')?.value,
      usuario: this.formRegistro.get('IMEI')?.value
  }
  return accesorioModel;
  }
  validarCampos(nombreCampo: string) {
    return this.formRegistro.get(nombreCampo)?.invalid && 
          this.formRegistro.get(nombreCampo)?.touched
  }

  obtenerMarcasLista(){
    this.catalogosService.getMarcasLista()
                    .subscribe(marca=>{
                      this.marcaListado = marca;
                    })
  }
  validarCostoMask(){
  
    const costoValue = this.formRegistro.get('costo')?.value;
    if (costoValue < 999) {
      this.costoMask = "000"
    }
    if (costoValue > 999) {
      this.costoMask = "0,0000"
    }
     if(costoValue > 9999){
      this.costoMask = "00,000"
    }
     if(costoValue > 99999){
      this.costoMask = "000,000"
    }
    console.log(this.costoMask);
    
    return  this.costoMask; 
  }

}
