import { Component, OnInit, OnDestroy } from '@angular/core';
import { Almacen } from 'src/app/core/interfaces/catalogo.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EquipoTransferencia, EquipoTransferenciaReporte } from 'src/app/core/interfaces/equipo.interface';
import { EquipoService } from '../../../../core/services/equipo.service';
import { ToastrService } from 'ngx-toastr';
import { EquipoAlmacenTransferir } from '../../../../core/interfaces/equipo.interface';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/auth/login.service';

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
    private loginService: LoginService,
    ) { }

  ngOnInit(): void {
    this.getAlmacenes();
    this.getTransferenciaId();
  }
  ngOnDestroy(): void {
    if (!this.listEquiposToTransfer.length) {
      this.sub.unsubscribe();
        this.getTransferenciaId();
    }
  }
  sub!: Subscription;
  almacenes: Almacen[]=[];
  listEquiposToTransfer:EquipoTransferencia[]=[];
  equipoToTransfer:EquipoAlmacenTransferir[]=[];
  idTransferencia!: number;
  cantidadEquipoATransferir: number=0;
  printing: boolean = false;
  submitted: boolean = false;

  form: FormGroup = this.fb.group({
    imei:['',Validators.required],
    almacen:[2,]
  })
  validateImei():boolean{
    let bool= false;
    this.listEquiposToTransfer.forEach((imeiAdded)=>
    {
      if(this.form.get('imei')?.value ==imeiAdded.imei){

        this.toastr.info('Ya el imei esta añadido a la lista!','',{'progressBar': true,'closeButton':true,timeOut:2000});
         bool=true
      }
    });
    return bool;
  }
  postTransferenciaEquipo(equipoToTransfer:EquipoAlmacenTransferir){
    this.equipoService.postTransferenciaEquipo(equipoToTransfer)
    .subscribe(()=>{
      this.toastr.success('Equipo tranferido','', {'progressBar': true,'closeButton':true,timeOut:2000});
    })
  }
  deleteEquipo(imei: string){

    this.equipoToTransfer.splice(this.equipoToTransfer.findIndex(id=>id.imei === imei),1)
    this.listEquiposToTransfer.splice(this.listEquiposToTransfer.findIndex(id=>id.imei === imei),1);
    this.cantidadEquipoATransferir = this.listEquiposToTransfer.length
    if (!this.listEquiposToTransfer.length) {
      this.sub.unsubscribe();
      this.cantidadEquipoATransferir =0;
      this.ngOnDestroy();
    }
  }
  validateInput(control:string){
    return  (!this.form.controls[control].value && this.form.controls[control].touched )
  }
  getEquipoByImei(){
    if (this.form.get('imei')?.value) {

    this.equipoService.getEquipoByImei(this.form.get('imei')?.value)
    .subscribe((equipo)=>{
      if(this.validateImei())return
        if (equipo.mensaje !== null && equipo.mensaje.includes('Vendido')  ) {
          this.toastr.warning(equipo.mensaje)
          return
        }
        else if(equipo.imei == null){
          this.toastr.error('Imei no encontrado!','',{'progressBar': true,'closeButton':true,timeOut:2000})
          return
        }
        else{
          const model:EquipoTransferencia ={
            imei: equipo.imei,
            modelo: equipo.modelo,
            almacenSalida: equipo.almacenSalida,
            almacenDestino: equipo.almacenDestino,
           // almacenDestino: this.form.get('almacen')?.value == "2"?'Principal':'Garantias' ,
            mensaje: '',
            usuario: this.loginService.getUserName(),
          }
          this.listEquiposToTransfer.unshift(model);

          this.cantidadEquipoATransferir = this.listEquiposToTransfer.length;
          const transfer: EquipoAlmacenTransferir={
            id: this.idTransferencia,
            imei: equipo.imei,
            almacenSalida:Number( equipo.almacenSalidaId),
            almacenDestino: this.form.get('almacen')?.value,
            cantidadEquipos: this.cantidadEquipoATransferir,
            modelo: equipo.modelo,
            usuario:this.loginService.getUserName(),
          }
          this.postTransferenciaEquipo(transfer);
          this.form.get('imei')?.reset();
        }
      });
    }
    else{
      this.submitted = true
    }

  }
  printReportEquipoVendido(){
    const model :EquipoTransferenciaReporte = {
      idTransferencia: this.idTransferencia,
      equipoTransferencias: this.listEquiposToTransfer,
      fechaTransferencia: new Date().toDateString(),
      usuario: '',
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
