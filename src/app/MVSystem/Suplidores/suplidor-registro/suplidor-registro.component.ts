import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProveedorService } from '../../services/proveedor.service';
import { ToastrService } from 'ngx-toastr';
import { TipoTelefono } from '../../interfaces/catalogo.interface';
import { Proveedor, ProveedorRegistro, TipoProveedor } from '../../interfaces/proveedor.interface';
import { CatalogosService } from '../../services/catalogos.service';


@Component({
  selector: 'app-suplidor-registro',
  templateUrl: './suplidor-registro.component.html',
  styleUrls: ['./suplidor-registro.component.css']
})
export class SuplidorRegistroComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private proveedorService: ProveedorService,
    private catalogosService: CatalogosService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.formRegistro.controls.extensionNumero.disable();

    this.obtenerTipoProveedor();
    this.obtenerTipoTelefonos();
  }
  proveedor: ProveedorRegistro[]=[];
  proveedorListar!: Proveedor;
  listaTipoProveedor: TipoProveedor[]=[];
  listaTipoTelefonos: TipoTelefono[]=[];
  bool!: boolean;
//Forms
formRegistro: FormGroup = this.fb.group({
  nombre:       ['Xavier Proveedor', [Validators.required]],
  apellido:     ['Mejia', Validators.required],
  tipoProveedor:  [1],
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

modeloRegistroProveedor(){
  let direccion: any =[
    this.formRegistro.get('calle')?.value ,
    this.formRegistro.get('casaNumero')?.value,
    this.formRegistro.get('sector')?.value ,
    this.formRegistro.get('provincia')?.value

];
    const registro: ProveedorRegistro = {
        nombres:         this.formRegistro.get('nombre')?.value,
        apellidos:       this.formRegistro.get('apellido')?.value,
        numero_Telefono: this.formRegistro.get('telefono')?.value,
        iD_Tipo_Telefono:Number( this.formRegistro.get('tipoTelefono')?.value),
        iD_Tipo_Suplidor:Number(this.formRegistro.get('tipoProveedor')?.value),
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
obtenerTipoProveedor(){
  this.proveedorService.getTipoProveedorLista()
      .subscribe(tipoProveedor =>{
        console.log(tipoProveedor);
        
          this.listaTipoProveedor = tipoProveedor;
      });
}
registroProveedor(){
  this.formRegistro.markAllAsTouched();

  const model: ProveedorRegistro = this.modeloRegistroProveedor();
  console.log(model);
  
  if (this.formRegistro.valid) {
      this.proveedorService.postProveedor(model)
          .subscribe((proveedorInsertado: any) =>{
      console.log( proveedorInsertado);
      console.log(model);
      
      this.proveedorListar = proveedorInsertado;
      console.log(this.proveedorListar);
      
      if (proveedorInsertado.mensaje.includes('ya está')) {
        this.toastr.error(proveedorInsertado.mensaje, '',{closeButton: true,progressBar:true});
      }
      else{
        this.toastr.success(proveedorInsertado.mensaje, '',{closeButton: true,progressBar:true});
        this.formRegistro.reset({
            tipoProveedor: 1,
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
