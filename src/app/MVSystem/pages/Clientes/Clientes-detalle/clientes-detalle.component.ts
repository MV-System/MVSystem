import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from 'src/app/core/services/clientes.service';
import { Cliente } from 'src/app/core/interfaces/cliente.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-clientes-detalle',
  templateUrl: './clientes-detalle.component.html',
  styleUrls: ['./clientes-detalle.component.css']
})
export class ClientesDetalleComponent implements OnInit {
  cliente: Cliente | null = null;
  isLoading: boolean = true;
  clienteId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientesService: ClientesService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.clienteId = +params['id'];
      if (this.clienteId) {
        this.cargarDetalleCliente();
      } else {
        this.toastr.error('ID de cliente no válido');
        this.router.navigate(['/mvSystem/clientes/consulta']);
      }
    });
  }

  cargarDetalleCliente(): void {
    this.isLoading = true;
    // Por ahora, vamos a obtener el cliente de la lista
    // Más tarde podemos crear un método específico para obtener un cliente por ID
    this.clientesService.getClientesPorNombreTelefono('')
      .subscribe({
        next: (clientes) => {
          this.cliente = clientes.find(c => c.id_Cliente === this.clienteId) || null;
          this.isLoading = false;
          
          if (!this.cliente) {
            this.toastr.error('Cliente no encontrado');
            this.router.navigate(['/mvSystem/clientes/consulta']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error('Error al cargar los detalles del cliente');
          console.error('Error:', error);
        }
      });
  }

  editarCliente(): void {
    if (this.cliente) {
      this.router.navigate(['/mvSystem/clientes/editar', this.cliente.id_Cliente]);
    }
  }

  volverAConsulta(): void {
    this.router.navigate(['/mvSystem/clientes/consulta']);
  }

  formatearTelefono(telefono: number): string {
    const telefonoStr = telefono.toString();
    if (telefonoStr.length === 10) {
      return `${telefonoStr.substring(0, 3)}-${telefonoStr.substring(3, 6)}-${telefonoStr.substring(6)}`;
    }
    return telefonoStr;
  }
}
