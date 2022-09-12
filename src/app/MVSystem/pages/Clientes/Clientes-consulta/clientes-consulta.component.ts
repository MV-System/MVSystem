import { Component, OnInit } from '@angular/core';
import { ClientesService } from 'src/app/MVSystem/services/clientes.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ClienteConsultaCriterio } from 'src/app/MVSystem/interfaces/cliente.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-clientes-consulta',
  templateUrl: './clientes-consulta.component.html',
  styleUrls: ['./clientes-consulta.component.css']
})
export class ClientesConsultaComponent implements OnInit {
  listaClientes: ClienteConsultaCriterio[] = [];

  constructor(private clientesService: ClientesService,
    private fb: FormBuilder,
    private toastr: ToastrService) { }


  ngOnInit(): void {
  }
  page: number = 1;
  formBusqueda: FormGroup = this.fb.group({
    criterio: ['',]
  })
  criterioBusqueda: any = {
    criterio: '',
  }
  obtenerClientesPorNombreTelefono() {

    this.criterioBusqueda.criterio = this.formBusqueda.controls.criterio.value;


    this.clientesService.getClientesPorNombreTelefono(this.criterioBusqueda.criterio)
      .subscribe(cliente => {
        this.listaClientes = cliente;

        if (cliente.length == 0) {
          this.toastr.error("No existen datos con este criterio de busqueda!")

        }
      });
  }
  pageChanged(index: number) {
    this.page = index
  }

}
