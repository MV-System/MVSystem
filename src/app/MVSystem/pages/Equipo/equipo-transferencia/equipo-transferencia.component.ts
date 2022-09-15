import { Component, OnInit } from '@angular/core';
import { Almacen } from 'src/app/MVSystem/interfaces/catalogo.interface';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EquipoTransferencia } from 'src/app/MVSystem/interfaces/equipo.interface';
import { EquipoService } from '../../../services/equipo.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-equipo-transferencia',
  templateUrl: './equipo-transferencia.component.html',
  styleUrls: ['./equipo-transferencia.component.css']
})
export class EquipoTransferenciaComponent implements OnInit {

  constructor(
    private equipoService:EquipoService,
    private catalogosService: CatalogosService,
    private fb: FormBuilder,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.getAlmacenes();
  }
  almacenes: Almacen[]=[];
  equiposToTranfer:EquipoTransferencia[]=[];
  
  form: FormGroup = this.fb.group({
    imei:[''],
    almacen:['Principal',]
  })
  validateImei():boolean{
    let bool= false;
    this.equiposToTranfer.forEach((imeiAdded)=>
    {
      if(this.form.get('imei')?.value ==imeiAdded.imei){

        this.toastr.info('Ya el imei esta añadido a la lista!');
         bool=true
      } 
    });
    return bool;
  }
  getEquipoByImei(){
    this.equipoService.getEquipoByImei(this.form.get('imei')?.value)
    .subscribe((equipo)=>{
      !equipo.length?this.toastr.error('Imei no encontrado!'):equipo; 
      if(this.validateImei()){
          return
      }
      equipo.forEach((equipoResp)=>{
        
        if (equipo[0].mensaje.length) {
          this.toastr.warning(equipo[0].mensaje)
        }
        else{
          const model:EquipoTransferencia ={
            imei: equipoResp.imei,
            modelo: equipoResp.modelo,
            procedencia: '',
            destino: this.form.get('almacen')?.value,
            mensaje: ''
          }
          this.equiposToTranfer.push(model);
        }
      });
    
    });
  }
  getAlmacenes() {
    this.catalogosService.getAlmaceLista().subscribe((almacen) => {
      this.almacenes = almacen;
    });
  }
}
