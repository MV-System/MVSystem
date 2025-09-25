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
        this.router.navigate(['../consulta'], { relativeTo: this.route });
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
          this.cliente = clientes.find(c => (c.id_Cliente) === this.clienteId) || null;
          this.isLoading = false;

          if (!this.cliente) {
            this.toastr.error('Cliente no encontrado');
            this.router.navigate(['../consulta'], { relativeTo: this.route });
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
      const clienteId = this.cliente.id_Cliente;
      console.log('Navegando a editar cliente desde detalle:', clienteId);
      // Usar navegación absoluta para evitar problemas de rutas relativas
      this.router.navigateByUrl(`/home/clientes/editar/${clienteId}`);
    }
  }

  volverAConsulta(): void {
    // Navegar directamente a la URL completa para forzar recarga
    this.router.navigateByUrl('/home/clientes/consulta');
  }

  formatearTelefono(telefono: number): string {
    const telefonoStr = telefono.toString();
    if (telefonoStr.length === 10) {
      return `${telefonoStr.substring(0, 3)}-${telefonoStr.substring(3, 6)}-${telefonoStr.substring(6)}`;
    }
    return telefonoStr;
  }

  /**
   * Helper methods for data compatibility between old and new API format
   */
  getClienteId(): number {
    return this.cliente?.id_Cliente || 0;
  }

  getClienteNombres(): string {
    return this.cliente?.nombres || '';
  }

  getClienteApellidos(): string {
    return this.cliente?.apellidos || '';
  }

  getClienteTelefono(): number {
    return this.cliente?.numero_de_telefono || 0;
  }

  getClienteEmail(): string {
    return this.cliente?.email || '';
  }

  getClienteTipoDescripcion(): string {
    return this.cliente?.tipo_de_Cliente ||'';
  }
  getClienteCanal(): string {
    return this.cliente?.canal_Nombre || '';
  }

  getClienteLimiteCredito(): string {
    return this.cliente?.limite_Credito ||
           (this.cliente as any)?.limite_Credito ||
           this.cliente?.limite_Credito || '';
  }

  getClienteDireccion(): string {
    return this.cliente?.direccion ||'';
  }

  getClienteExtencion(): number | null {
    return this.cliente?.extencion || null;
  }
}
