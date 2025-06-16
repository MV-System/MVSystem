import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoginService } from 'src/app/auth/login.service';
import { MarcaEquipo, ModeloEquipo } from 'src/app/core/interfaces/catalogo.interface';
import { Cliente } from 'src/app/core/interfaces/cliente.interface';
import { DefaultFilter, RegistroReparaciones } from 'src/app/core/interfaces/equipo.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { ClientesService } from 'src/app/core/services/clientes.service';
import { EquipoService } from 'src/app/core/services/equipo.service';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { RDialogService } from 'src/app/shared/components/r-dialog/r-dialog.service';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';

@Component({
  selector: 'app-reparaciones',
  templateUrl: './reparaciones.component.html',
  styleUrls: ['./reparaciones.component.css']
})
export class ReparacionesComponent implements OnInit {
 isLoading = false;
   generarReporteLoading: boolean = false;

    formEquipoReparado: FormGroup = this.fb.group({
    criterio: [''],
    rangeDate: [''],
  })

  filtro: DefaultFilter = {
    pageIndex: 1,
    pageSize: 10,
    fechaInicio : '',
    fechaFinal : ''
  }

// Obtener la fecha actual
 fechaHoy = new Date();
  listaMarca: MarcaEquipo[] = [];
  listaModelo: ModeloEquipo[] = [];
  subs: Subscription[] = [];
  destroy$: Subject<any> = new Subject<any>();
  customer!: Cliente;
  customers: Cliente[] = []
  btnDisabled: boolean = true;
  IdReparacion : number = 0;
  formRegistroReparaciones: FormGroup = this.fb.group({
    IMEI: ["",],
    Costo: [, [Validators.required]],
    Detalle_Reparacion: ["",],
    Observaciones: ["",],
    Usuario: [this.loginService.getUserName(),],
    ID_Cliente:[],
    Precio:  [, [Validators.required]],
    Fecha_Entrega: [this.fechaHoy],
    telefono:'',
    ID_Modelo:[],
    marca:[],
    modelo:[],


  })
  constructor(
    private loading: LoadingService,
     private equipoService: EquipoService,
    private rDialogService: RDialogService,
    private catalogosService: CatalogosService,
    private clientesService: ClientesService,
    private mantenimientoService: MantenimientoService,
    private toastr: ToastrService,
    private loginService: LoginService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.obtenerMarcasLista();
    this.obtenerClientes();
    this.obtenerMarcasLista();
  }
  obtenerMarcasLista() {
    this.catalogosService.getMarcasLista().subscribe((marca) => {
      this.listaMarca = marca;
    });
  }
  obtenerClientes() {
    this.clientesService.getClientesPorNombreTelefono('')
      .pipe(takeUntil(this.destroy$))
      .subscribe(clientes => {
        this.customers = clientes
      })
  }
  modeloRegistroReparacion() {
    const model: RegistroReparaciones = {
     IMEI: this.formRegistroReparaciones.get('IMEI')?.value,
     ID_Cliente:this.customer.id_Cliente,// Number(this.formRegistroReparaciones.get('ID_Cliente')?.value),
     Detalle_Reparacion: String(this.formRegistroReparaciones.get('Detalle_Reparacion')?.value),
     Observaciones: String(this.formRegistroReparaciones.get('Observaciones')?.value),
     Costo: Number(this.formRegistroReparaciones.get('Costo')?.value),
     Precio: Number(this.formRegistroReparaciones.get('Precio')?.value),
     Fecha_Entrega: String(this.formRegistroReparaciones.get('Fecha_Entrega')?.value),
     ID_Modelo: Number(this.formRegistroReparaciones.get('modelo')?.value),
     Usuario: this.loginService.getUserName(),
     mensajeSalida:'',
     idReparacion: 0
   }
      return model;
 }
 onAddCustomer(customer: Cliente) {
  this.customer = customer;
  this.clientesService.isOpeningForm$.next(false);
  if (customer) {
    // Agregar el nuevo cliente a la lista de 'customers'
    this.customers = [customer, ...this.customers];
   this.formRegistroReparaciones.get('telefono')?.setValue(this.customer.numero_Telefono);

    this.obtenerClientesPorNombreTelefono(this.customer.numero_Telefono);
    // Mostrar mensaje de éxito
  } else {
    // Si el campo 'telefono' está vacío, mostramos una advertencia
    this.toastr.warning('Por favor ingrese un número de teléfono.');
  }

}
 validarCamposFormCostoDetalle() {

  if (
    this.formRegistroReparaciones.get('Precio')?.value <
    this.formRegistroReparaciones.get('Costo')?.value && this.formRegistroReparaciones.get('Costo')?.value !== null) {
    this.formRegistroReparaciones.setErrors({ error: '' })
    this.toastr.error(
      'El monto del Precio no puede ser menor que el Costo',
      '',
      { closeButton: true, progressBar: true }
    );
    return;
  }
}
msgValidacionesCamposFormNumericos() {
  let camposNumerico: string[] = [
    'Costo',
    'Precio',
  ];
  camposNumerico.forEach((campo) => {
    if (
      this.formRegistroReparaciones.get(campo)?.value < 0 ||
      this.formRegistroReparaciones.get(campo)?.value == 0
    ) {
      this.formRegistroReparaciones.setErrors({ error: '' })
      this.toastr.error('Los valores de los campos deben ser mayor a 0', '', {
        closeButton: true,
        progressBar: true,
      });
      return;
    }
  });
}
btnDisable() {
  return this.formRegistroReparaciones.valid ? this.btnDisabled = false : this.btnDisabled = true;
}
 validacionesRegistro() {
  this.validarCamposFormCostoDetalle();
  this.msgValidacionesCamposFormNumericos();

}
obtenerClientesPorNombreTelefono(tel?: number) {

      if(tel){
        this.clientesService.getClientesPorNombreTelefono(tel)
        .pipe(takeUntil(this.destroy$))
        .subscribe(async customer => {

          // await this.loadCotizacionCliente(telefono);
          this.customer = customer[0];
        }, error => {
          this.toastr.error(error);
        });
      }
      else{
        const { telefono } = this.formRegistroReparaciones.value;
        this.clientesService.getClientesPorNombreTelefono(telefono)
          .pipe(takeUntil(this.destroy$))
          .subscribe(async customer => {

            // await this.loadCotizacionCliente(telefono);
            this.customer = customer[0];
          }, error => {
            this.toastr.error(error);
          });
      }
    }
selectoresMarcaModeloValidator() {

  this.formRegistroReparaciones.get('modelo')?.setValue('');
  if (this.formRegistroReparaciones.get('marca')?.value) {
    this.formRegistroReparaciones.controls.modelo.enable();

    this.obtenerModeloLista();
  }
  else {
    this.formRegistroReparaciones.controls.modelo.disable();

  }
}
obtenerModeloLista() {

  let idMarca = this.formRegistroReparaciones.get('marca')?.value;
  this.catalogosService.getModeloByMarcaLista(idMarca).subscribe((modelo) => {
    this.listaModelo = modelo;
  });
}
onAdd() {
  // Indicar que el formulario está siendo abierto
  this.clientesService.isOpeningForm$.next(true);
}
validarCampos(nombreCampo: string) {
  return (
    this.formRegistroReparaciones.get(nombreCampo)?.invalid &&
    this.formRegistroReparaciones.get(nombreCampo)?.touched
  );
}
registroReparacion() {
  console.log('registroReparacion llamado');
  const model: RegistroReparaciones = this.modeloRegistroReparacion();
  this.validacionesRegistro();
  if (this.formRegistroReparaciones.valid) {
     this.loading.showLoading();
    this.mantenimientoService.postReparacion(model)
      .subscribe((Reparacion) => {
        Reparacion.forEach((Respuesta) => {
          this.toastr.info(Respuesta.mensajeSalida);
          this.IdReparacion = Respuesta.idReparacion;
        });
        this.loading.hideLoading();
        this.rDialogService.openDialog("Aviso", 'Desea imprimir el Recibo?',
          () => {
            this.obtenerReporte(this.IdReparacion);
            this.toastr.success("Reparación registrada correctamente");
            this.formRegistroReparaciones.reset({});
          },
          () => {
            //this.toastr.info("no hacer nada");
            this.formRegistroReparaciones.reset({});
          },
          "No",
          "Si"
        );
      }, error => {
      //  this.isLoading = false;
        this.toastr.error('Error al registrar la reparación');
      });
  } else {
    this.formRegistroReparaciones.markAllAsTouched();
    const registroElement = document.getElementById('registro');
    if (registroElement) {
      registroElement.scrollIntoView({ behavior: 'smooth' });
    }
    this.toastr.error('Hay datos en el formulario incompletos', '', { closeButton: true, progressBar: true });
  }
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

 obtenerReporte(id_reparacion: number) {
  this.generarReporteLoading = true;
  this.equipoService.getEquipoReparadoReporte(
    id_reparacion,
    this.loginService.getUserIdEmpresa,
    this.loginService.getUserIdSucursal
  ).subscribe(blob => {
    this.generarReporteLoading = false;
    const newBlob = new Blob([blob], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(newBlob);

     const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    iframe.contentWindow?.print();

    //window.open(blobUrl, '_blank'); // Esto muestra el PDF en una nueva pestaña
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000); // Libera el recurso después de 10s
  }, (err) => {
    this.generarReporteLoading = false;
    this.toastr.error('Error', 'No se pudo generar el reporte');
  });
}
}
