import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  isLoading: boolean = false;

  constructor(
    private clientesService: ClientesService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }


  ngOnInit(): void {
    // Load all clients when component initializes
    this.cargarTodosLosClientes();
  }
  page: number = 1;
  formBusqueda: FormGroup = this.fb.group({
    criterio: ['',]
  })
  obtenerClientesPorNombreTelefono() {
    let criterio = this.formBusqueda.controls.criterio.value;
    this.isLoading = true;

    this.clientesService.getClientesPorNombreTelefono(criterio)
      .subscribe({
        next: (cliente) => {
          this.listaClientes = cliente;
          this.isLoading = false;

          if (cliente.length == 0) {
            this.toastr.info("No se encontraron clientes con este criterio de búsqueda", "Sin resultados");
          } else {
            this.toastr.success(`Se encontraron ${cliente.length} cliente(s)`, "Búsqueda exitosa");
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error("Error al buscar clientes", "Error");
          console.error('Error:', error);
        }
      });
  }

  /**
   * Navigate to client registration page
   */
  agregarCliente() {
    console.log('Navegando a registro de cliente...');
    console.log('Current URL:', this.router.url);

    // Usar navegación relativa desde la ruta actual
    this.router.navigate(['../registro'], { relativeTo: this.route }).then(
      (success) => {
        console.log('Navegación exitosa:', success);
        if (success) {
          this.toastr.success('Navegando al formulario de registro', 'Éxito');
        } else {
          console.log('Navegación relativa falló, probando ruta absoluta...');
          // Si la navegación relativa falla, probar ruta absoluta
          this.router.navigate(['/mvSystem/home/clientes/registro']).then(
            (success2) => {
              if (success2) {
                this.toastr.success('Navegación exitosa', 'Éxito');
              } else {
                this.toastr.error('No se pudo navegar a la página de registro', 'Error');
                console.error('Ambas rutas fallaron');
              }
            }
          );
        }
      }
    ).catch(error => {
      console.error('Error en navegación:', error);
      this.toastr.error('Error al navegar. Revisa la consola para más detalles.', 'Error');
    });
  }

  /**
   * Navigate to client detail page
   */
  verDetalle(clienteId: number) {
    console.log('Navegando a detalle del cliente:', clienteId);
    this.router.navigate(['../detalle', clienteId], { relativeTo: this.route });
  }

  /**
   * Navigate to client edit page
   */
  editarCliente(clienteId: number) {
    console.log('Navegando a editar cliente:', clienteId);
    this.router.navigate(['../editar', clienteId], { relativeTo: this.route });
  }

  /**
   * Load all clients on component initialization
   */
  cargarTodosLosClientes() {
    console.log('Cargando todos los clientes...');
    this.isLoading = true;

    this.clientesService.getClientesPorNombreTelefono('')
      .subscribe({
        next: (clientes) => {
          console.log('Clientes cargados:', clientes.length);
          this.listaClientes = clientes;
          this.isLoading = false;

          if (clientes.length > 0) {
            this.toastr.success(`Se cargaron ${clientes.length} cliente(s)`, "Clientes cargados");
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error("Error al cargar clientes", "Error");
          console.error('Error al cargar clientes:', error);
        }
      });
  }

  /**
   * Clear search and reload all clients
   */
  limpiarBusqueda() {
    this.formBusqueda.reset();
    this.cargarTodosLosClientes();
  }
  pageChanged(index: number) {
    this.page = index
  }

  /**
   * Detect if the current screen is mobile
   */
  isMobileScreen(): boolean {
    return window.innerWidth <= 768;
  }

  /**
   * Detect if the current screen needs compact buttons (responsive design)
   * This considers both screen size and available space
   */
  needsCompactButtons(): boolean {
    return window.innerWidth < 1200; // Bootstrap's xl breakpoint
  }

  /**
   * Helper methods for data compatibility between old and new API format
   */
  getClienteId(cliente: Cliente): number {
    return cliente.Id_Cliente || cliente.id_Cliente || 0;
  }

  getClienteNombres(cliente: Cliente): string {
    return cliente.Nombres || cliente.nombres || '';
  }

  getClienteApellidos(cliente: Cliente): string {
    return cliente.Apellidos || cliente.apellidos || '';
  }

  getClienteTelefono(cliente: Cliente): number {
    // Intentar múltiples variaciones del campo teléfono
    const telefono = cliente.Numero_de_telefono ||
                    (cliente as any).numero_de_telefono ||
                    cliente.numero_Telefono ||
                    (cliente as any).Numero_Telefono ||
                    (cliente as any)['Numero de telefono'] ||
                    (cliente as any)['numero de telefono'] ||
                    0;

    return telefono;
  }

  getClienteEmail(cliente: Cliente): string {
    return cliente.Email ||
           (cliente as any).email ||
           cliente.email_Detalle || '';
  }

  getClienteTipoDescripcion(cliente: Cliente): string {
    return cliente.Tipo_de_Cliente ||
           (cliente as any).tipo_de_Cliente ||
           cliente.tipo_Cliente_Descripcion || '';
  }

}
