import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TipoTelefono } from '../../../interfaces/catalogo.interface';
import { CatalogosService } from '../../../services/catalogos.service';
import { Suplidor, SuplidorRegistro, TipoSuplidor } from 'src/app/MVSystem/interfaces/suplidor.interface';
import { SuplidorService } from 'src/app/MVSystem/services/Suplidor.service';


@Component({
  selector: 'app-suplidor-registro',
  templateUrl: './suplidor-registro.component.html',
  styleUrls: ['./suplidor-registro.component.css']
})
export class SuplidorRegistroComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private suplidorService:SuplidorService,
    private catalogosService: CatalogosService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.formRegistro.controls.extensionNumero.disable();

    this.obtenerTipoSuplidor();
    this.obtenerTipoTelefonos();
  }
  suplidor: SuplidorRegistro[]=[];
  suplidorListar!: Suplidor;
  listaTipoSuplidores: TipoSuplidor[]=[];
  listaTipoTelefonos: TipoTelefono[]=[];
  bool!: boolean;
//Forms
formRegistro: FormGroup = this.fb.group({
  nombre:       ['Xavier suplidor', [Validators.required]],
  apellido:     ['Mejia', Validators.required],
  tipoSuplidor:  [1],
  tipoTelefono: [1],
  telefono:     [8099728439,Validators.required],
  extensionNumero: [] ,
  email:        [''],
  // criterio:     [''],
  usuario:      ['Xmejia'],
  provincia:  ['Santo Domingo'],
  sector:     ['Buena Vista'],
  calle:      ['Primera'],
  casaNumero: ['#18'],
});

modeloRegistroSuplidor(){
  let direccion: any =[
    this.formRegistro.get('calle')?.value ,
    this.formRegistro.get('casaNumero')?.value,
    this.formRegistro.get('sector')?.value ,
    this.formRegistro.get('provincia')?.value

];
    const registro: SuplidorRegistro = {
        nombres:         this.formRegistro.get('nombre')?.value,
        apellidos:       this.formRegistro.get('apellido')?.value,
        numero_Telefono: this.formRegistro.get('telefono')?.value,
        iD_Tipo_Telefono:Number( this.formRegistro.get('tipoTelefono')?.value),
        iD_Tipo_Suplidor:Number(this.formRegistro.get('tipoSuplidor')?.value),
        extencion:       this.formRegistro.get('extencion')?.value,
        email_Detalle:   this.formRegistro.get('email')?.value,
        usuario:         this.formRegistro.get('usuario')?.value,
        direccion_Detalle:     direccion.toString(),
    }
    return registro;
}

onCheckboxChange(event: any) {
  if(event.target.checked == false) {
      this.formRegistro.controls.extensionNumero.disable();
      this.formRegistro.get('extensionNumero')?.setValue("");
  } 
  else{
      this.formRegistro.controls.extensionNumero.enable();
    }
    console.log(event);
    
}

get emailErrorMsg(): string{
  const errors = this.formRegistro.get('email')?.errors;
     if(errors?.pattern){
       return 'El valor no tiene formato de correo';
     }
     return ''
   }
validarCampos(nombreCampo: string) {
  return this.formRegistro.get(nombreCampo)?.invalid && 
         this.formRegistro.get(nombreCampo)?.touched
}
obtenerTipoTelefonos(){
    this.catalogosService.getTipoTelefonoLista()
        .subscribe(tipoTelefono =>{
            this.listaTipoTelefonos = tipoTelefono;
        });
}
obtenerTipoSuplidor(){
  this.suplidorService.getTipoSuplidorLista()
      .subscribe(tipoSuplidor =>{
        console.log(tipoSuplidor);
        
          this.listaTipoSuplidores = tipoSuplidor;
      });
}
registroSuplidores(){
  this.formRegistro.markAllAsTouched();

  const model: SuplidorRegistro = this.modeloRegistroSuplidor();
  console.log(model);
  
  if (this.formRegistro.valid) {
      this.suplidorService.postSuplidor(model)
          .subscribe((suplidorInsertado: any) =>{
      console.log( suplidorInsertado);
      console.log(model);
      
      this.suplidorListar = suplidorInsertado;
      console.log(this.suplidorListar);
      
      if (suplidorInsertado.mensaje.includes('ya está')) {
        this.toastr.error(suplidorInsertado.mensaje, '',{closeButton: true,progressBar:true});
      }
      else{
        this.toastr.success(suplidorInsertado.mensaje, '',{closeButton: true,progressBar:true});
        this.formRegistro.reset({
            tipoSuplidor: 1,
            tipoTelefono: 1
        });
        console.log('OK');
      }
    });
    
  }
  else{
      this.toastr.error('Hay datos en el formulario incompletos', '',{closeButton: true,progressBar:true});
  }

}


}
