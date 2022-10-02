import { Component, OnInit } from '@angular/core';
import { Almacen } from 'src/app/MVSystem/interfaces/catalogo.interface';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EquipoTransferencia, EquipoTransferenciaReporte } from 'src/app/MVSystem/interfaces/equipo.interface';
import { EquipoService } from '../../../services/equipo.service';
import { ToastrService } from 'ngx-toastr';
import { EquipoAlmacenTransferir } from '../../../interfaces/equipo.interface';

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
    private toastr: ToastrService,
    ) { }

  ngOnInit(): void {
    this.getAlmacenes();
    this.getTransferenciaId();
  }
  almacenes: Almacen[]=[];
  listEquiposToTransfer:EquipoTransferencia[]=[];
  equipoToTransfer:EquipoAlmacenTransferir[]=[];
  idTransferencia!: number;
  cantidadEquipoATransferir: number=0;
  printing: boolean = false;

  form: FormGroup = this.fb.group({
    imei:[''],
    almacen:[2,]
  })
  validateImei():boolean{
    let bool= false;
    this.listEquiposToTransfer.forEach((imeiAdded)=>
    {
      if(this.form.get('imei')?.value ==imeiAdded.imei){

        this.toastr.info('Ya el imei esta añadido a la lista!');
         bool=true
      } 
    });
    return bool;
  }
  postTransferenciaEquipo(equipoToTransfer:EquipoAlmacenTransferir){
    
    this.equipoService.postTransferenciaEquipo(equipoToTransfer)
    .subscribe(resp=>{
      console.log(resp);
      
    })
  }
  deleteEquipo(imei: string){
    this.equipoToTransfer.splice(this.equipoToTransfer.findIndex(id=>id.imei === imei),1)
   return this.listEquiposToTransfer.splice(this.listEquiposToTransfer.findIndex(id=>id.imei === imei),1);
  //  return this.listEquiposToTransfer= this.listEquiposToTransfer.filter((equipoId,index)=> index !== i);
  }
  getEquipoByImei(){
    
    this.equipoService.getEquipoByImei(this.form.get('imei')?.value)
    .subscribe((equipo)=>{
      
      !equipo.length?this.toastr.error('Imei no encontrado!'):equipo; 
      if(this.validateImei())return
      equipo.forEach((equipoResp)=>{
        
        if (equipo[0].mensaje.length) {
          this.toastr.warning(equipo[0].mensaje)
        }
        else{
          const model:EquipoTransferencia ={
            imei: equipoResp.imei,
            modelo: equipoResp.modelo,
            almacenSalida: equipoResp.almacenSalida,
            almacenDestino: this.form.get('almacen')?.value == "2"?'Principal':'Garantias' ,
            mensaje: '',
          }
          this.listEquiposToTransfer.unshift(model);

          this.cantidadEquipoATransferir = this.listEquiposToTransfer.length;
          const transfer: EquipoAlmacenTransferir={
            id: this.idTransferencia,
            imei: equipoResp.imei,
            almacenSalida:Number( equipoResp.almacenSalidaId),
            almacenDestino: this.form.get('almacen')?.value,
            cantidadEquipos: this.cantidadEquipoATransferir,
            modelo: equipoResp.modelo
          }
          this.postTransferenciaEquipo(transfer);
          this.form.get('imei')?.reset();
          // this.equipoToTransfer.push(transfer)
        }
      });
    });
  }
  printReportEquipoVendido(){

      const model :EquipoTransferenciaReporte = {
        idTransferencia: this.idTransferencia,
        equipoTransferencias: this.listEquiposToTransfer,
        fechaTransferencia: new Date().toDateString(),
        usuario: 'Xavier',
        total: this.cantidadEquipoATransferir
      }

    this.equipoService.postEquipoTransferencia(model)
    .subscribe((blobResp)=>{
      this.printing = !this.printing;
      var blob = new Blob([blobResp], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
    },(err)=>{
      this.printing = !this.printing;    
      this.toastr.error('Error al imprimir reporte');
    })
    this.listEquiposToTransfer =[];
    this.printing = !this.printing;

  }
  getTransferenciaId(){
    this.equipoService.getTransferenciaId()
    .subscribe((id)=>{
      this.idTransferencia = id + 1;
    })
  }
  getAlmacenes() {
    this.catalogosService.getAlmaceLista().subscribe((almacen) => {
      this.almacenes = almacen;
    });
  }
}
