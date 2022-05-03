import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CatalogosService } from '../../../services/catalogos.service';
import { MarcaEquipo } from '../../../interfaces/catalogo.interface';

@Component({
  selector: 'app-accesorios',
  templateUrl: './accesorios.component.html',
  styleUrls: ['./accesorios.component.css']
})
export class AccesoriosComponent implements OnInit {
  marcaListado: MarcaEquipo[]=[];
  costoMask: string = "";

  constructor(private fb: FormBuilder,
              private catalogosService: CatalogosService) { }

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
  marca: [,Validators.required] 
});

  
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
