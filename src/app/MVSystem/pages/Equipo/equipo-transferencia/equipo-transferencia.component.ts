import { Component, OnInit, OnDestroy } from '@angular/core';
import { Almacen } from 'src/app/MVSystem/interfaces/catalogo.interface';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EquipoTransferencia, EquipoTransferenciaReporte } from 'src/app/MVSystem/interfaces/equipo.interface';
import { EquipoService } from '../../../services/equipo.service';
import { ToastrService } from 'ngx-toastr';
import { EquipoAlmacenTransferir } from '../../../interfaces/equipo.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-equipo-transferencia',
  templateUrl: './equipo-transferencia.component.html',
  styleUrls: ['./equipo-transferencia.component.css']
})
export class EquipoTransferenciaComponent implements OnInit,OnDestroy {


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
  ngOnDestroy(): void {
    if (!this.listEquiposToTransfer.length) {
      this.sub.unsubscribe();
        console.log('destroy');
        this.getTransferenciaId();
    }
  }
  sub!: Subscription;
  almacenes: Almacen[]=[];
  listEquiposToTransfer:EquipoTransferencia[]=[];
  equipoToTransfer!:EquipoAlmacenTransferir[];
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
    .subscribe(()=>{
      this.toastr.success('Equipo tranferido','', {'progressBar': true,'closeButton':true,timeOut:2000});
      console.log(this.idTransferencia);
      
    })
  }
  deleteEquipo(imei: string){
 

    this.equipoToTransfer.splice(this.equipoToTransfer.findIndex(id=>id.imei === imei),1)
    this.listEquiposToTransfer.splice(this.listEquiposToTransfer.findIndex(id=>id.imei === imei),1);
    if (!this.listEquiposToTransfer.length) {
      this.sub.unsubscribe();
      this.cantidadEquipoATransferir =0;
      this.ngOnDestroy();
    }
  }
  getEquipoByImei(){
    
    this.equipoService.getEquipoByImei(this.form.get('imei')?.value)
    .subscribe((equipo)=>{
      console.log(equipo);
      
      !Object.keys(equipo).length?this.toastr.error('Imei no encontrado!'):equipo; 
      if(this.validateImei())return
      
        
        if (equipo.mensaje.length) {
          this.toastr.warning(equipo.mensaje)
        }
        else{
          const model:EquipoTransferencia ={
            imei: equipo.imei,
            modelo: equipo.modelo,
            almacenSalida: equipo.almacenSalida,
            almacenDestino: this.form.get('almacen')?.value == "2"?'Principal':'Garantias' ,
            mensaje: '',
          }
          console.log(model);
          
          this.listEquiposToTransfer.unshift(model);

          this.cantidadEquipoATransferir = this.listEquiposToTransfer.length;
          const transfer: EquipoAlmacenTransferir={
            id: this.idTransferencia,
            imei: equipo.imei,
            almacenSalida:Number( equipo.almacenSalidaId),
            almacenDestino: this.form.get('almacen')?.value,
            cantidadEquipos: this.cantidadEquipoATransferir,
            modelo: equipo.modelo
          }
          this.postTransferenciaEquipo(transfer);
          this.form.get('imei')?.reset();
        }
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
        this.getBlobForCreateIFramePDF(blobResp);
    },(err)=>{
      this.printing = !this.printing;    
      this.toastr.error('Error al imprimir reporte');
      
    });
    this.cantidadEquipoATransferir = 0;
    this.listEquiposToTransfer =[];
    this.printing = !this.printing;

  }
  getBlobForCreateIFramePDF(blobResp: Blob){
    var blob = new Blob([blobResp], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    iframe.contentWindow?.print();
  }
  getTransferenciaId(){
   this.sub= this.equipoService.getTransferenciaId()
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
