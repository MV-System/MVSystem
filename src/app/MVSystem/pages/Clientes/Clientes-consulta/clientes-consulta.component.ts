import { Component, OnInit } from '@angular/core';
import { ClientesService } from 'src/app/core/services/clientes.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ClienteConsultaCriterio } from 'src/app/core/interfaces/cliente.interface';
import { ToastrService } from 'ngx-toastr';
import { Cliente } from '../../../../core/interfaces/cliente.interface';

@Component({
  selector: 'app-clientes-consulta',
  templateUrl: './clientes-consulta.component.html',
  styleUrls: ['./clientes-consulta.component.css']
})
export class ClientesConsultaComponent implements OnInit {
  listaClientes: Cliente[] = [];

  constructor(private clientesService: ClientesService,
    private fb: FormBuilder,
    private toastr: ToastrService) { }


  ngOnInit(): void {

  }
  page: number = 1;
  formBusqueda: FormGroup = this.fb.group({
    criterio: ['',]
  })
  obtenerClientesPorNombreTelefono() {
    let criterio = this.formBusqueda.controls.criterio.value;
    this.clientesService.getClientesPorNombreTelefono(criterio)
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
