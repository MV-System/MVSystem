import { Component, OnInit, OnDestroy } from '@angular/core';
import { Almacen } from 'src/app/core/interfaces/catalogo.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {  EquipoTransferencia, EquipoTransferenciaReporte } from 'src/app/core/interfaces/equipo.interface';
import { EquipoService } from '../../../../core/services/equipo.service';
import { ToastrService } from 'ngx-toastr';
import { EquipoAlmacenTransferir } from '../../../../core/interfaces/equipo.interface';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/auth/login.service';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';

@Component({
  selector: 'app-equipo-transferencia',
  templateUrl: './equipo-transferencia.component.html',
  styleUrls: ['./equipo-transferencia.component.css']
})
export class EquipoTransferenciaComponent implements OnInit, OnDestroy {
  form: FormGroup;
  almacenes: Almacen[] = [];
  listEquiposToTransfer: EquipoTransferencia[] = [];
  equipoToTransfer: EquipoAlmacenTransferir[] = [];
  idTransferencia!: number;
  cantidadEquipoATransferir: number = 0;
  printing: boolean = false;
  submitted: boolean = false;
  sub!: Subscription;

  constructor(
    private loading: LoadingService,
    private equipoService: EquipoService,
    private catalogosService: CatalogosService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loginService: LoginService,
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.getAlmacenes();
    this.getTransferenciaId();
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      imei: ['', Validators.required],
      almacen: [2]  // Almacen por defecto: Plaza Central
    });
  }

  private cleanupSubscriptions(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  validateImei(): boolean {
    const imeiValue = this.form.get('imei')?.value;  // Si 'imei' es undefined, asigna una cadena vacía

    // Verifica si imeiValue es undefined o null antes de hacer la comparación
  if (!imeiValue) {
    return false;
  }

  const exists = this.listEquiposToTransfer.some(imeiAdded => imeiAdded.imei === imeiValue);

    if (exists) {
      this.toastr.info('Ya el IMEI está añadido a la lista!', '', {
        progressBar: true, closeButton: true, timeOut: 2000
      });
    }

    return exists;
  }

  postTransferenciaEquipo(equipoToTransfer: EquipoAlmacenTransferir): void {
    this.equipoService.postTransferenciaEquipo(equipoToTransfer).subscribe({
      next: (EquipoTransfer: EquipoAlmacenTransferir) => {
        this.equipoToTransfer.push(EquipoTransfer);
        this.toastr.success('Equipo transferido', '', { progressBar: true, closeButton: true, timeOut: 2000 });
      },
      error: () => {
        this.toastr.error('Error al transferir el equipo');
      }
    });
  }

  deleteEquipo(imei: string): void {
    const index = this.equipoToTransfer.findIndex(equipo => equipo.imei === imei);

    if (index !== -1) {
      this.equipoToTransfer.splice(index, 1);
      this.cantidadEquipoATransferir = this.equipoToTransfer.length;

    if (!this.equipoToTransfer.length) {
        this.cleanupSubscriptions();
        this.cantidadEquipoATransferir = 0;
        this.getTransferenciaId();
      }
    }
  }

  validateInput(control: string): boolean {
    // Verifica si el control existe y su valor
    const controlValue = this.form.controls[control]?.value;
    const controlTouched = this.form.controls[control]?.touched;

    // Asegúrate de que siempre devuelva un booleano
    return !controlValue && !!controlTouched;
  }

  getEquipoByImei(): void {
    const imeiValue = this.form.get('imei')?.value;

    if (!imeiValue) {
      this.submitted = true;
      return;
    }

    // Valida si el IMEI ya está en la lista antes de hacer la llamada al servicio
    if (this.validateImei()) return;

    // Llama al servicio para obtener el equipo por IMEI
    this.equipoService.getEquipoByImei(imeiValue).subscribe({
      next: (equipo) => {
        if (equipo.mensaje?.includes('Vendido')) {
          this.toastr.warning(equipo.mensaje);
          return;
        }

        if (!equipo.imei) {
          this.toastr.error('IMEI no encontrado!', '', { progressBar: true, closeButton: true, timeOut: 2000 });
          return;
        }

         // Si el equipo es válido, añadir a la lista y actualizar cantidad
        this.addEquipoToList(equipo); // Mantener el valor del campo 'almacen' al resetear solo el 'imei'
        const almacenValue = this.form.get('almacen')?.value;
        this.form.reset({ imei: '', almacen: almacenValue });
      },
      error: () => {
        this.toastr.error('Error al buscar el IMEI');
      }
    });
  }

  private addEquipoToList(equipo: any): void {
    // Crea el modelo del equipo para añadirlo a la lista
    const model: EquipoTransferencia = {
      Id_Transferencia: equipo.Id_Transferencia,
      imei: equipo.imei,
      modelo: equipo.modelo,
      almacenSalida: equipo.almacenSalida,
      almacenDestino: equipo.almacenDestino,
      usuario: this.loginService.getUserName(),

      mensaje: ''
    };
    // Añadir el equipo a la lista de transferencia
    this.listEquiposToTransfer.unshift(model);
    // Actualizar la cantidad de equipos a transferir
    this.cantidadEquipoATransferir = this.equipoToTransfer.length +1;

    // Crea el objeto para la transferencia
    const transfer: EquipoAlmacenTransferir = {
      id: this.idTransferencia,
      imei: equipo.imei,
      almacenSalida: Number(equipo.almacenSalidaId),
      almacenDestino: this.form.get('almacen')?.value,
      cantidadEquipos: this.cantidadEquipoATransferir,
      modelo: equipo.modelo,
      usuario: this.loginService.getUserName(),
      mensaje: equipo.mensaje
    };

    this.postTransferenciaEquipo(transfer);
  }

  printReportEquipoVendido(): void {
    this.loading.showLoading();
    const model: EquipoTransferenciaReporte = {
      idTransferencia: this.idTransferencia,
      equipoTransferencias: this.listEquiposToTransfer,
      fechaTransferencia: new Date().toDateString(),
      usuario: this.loginService.getUserName(),
      Empresa:this.loginService.getUserEmpresa,
      IdEmpresa:this.loginService.getUserIdEmpresa,
      total: this.cantidadEquipoATransferir
    };

    this.equipoService.postEquipoTransferencia(model).subscribe({
      next: (blobResp) => {
        this.printing = true;
        this.getBlobForCreateIFramePDF(blobResp);
      },
      error: () => {
        this.toastr.error('Error al imprimir reporte');
        this.printing = false;
      }
    });
this.loading.hideLoading();
    this.cantidadEquipoATransferir = 0;
    this.listEquiposToTransfer = [];
  }

  private getBlobForCreateIFramePDF(blobResp: Blob): void {
    const blob = new Blob([blobResp], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    iframe.contentWindow?.print();
  }

  getTransferenciaId(): void {
    this.sub = this.equipoService.getTransferenciaId().subscribe(id => {
      this.idTransferencia = id + 1;
    });
  }

  getAlmacenes(): void {
    this.loading.showLoading();
    this.catalogosService.getAlmaceLista().subscribe(almacenes => {
      this.almacenes = almacenes;
    });
    this.loading.hideLoading();
  }
}
