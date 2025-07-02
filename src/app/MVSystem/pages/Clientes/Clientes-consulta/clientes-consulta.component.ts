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
  ) { }


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
    this.router.navigate(['/mvSystem/clientes/detalle', clienteId]);
  }

  /**
   * Navigate to client edit page
   */
  editarCliente(clienteId: number) {
    console.log('Navegando a editar cliente:', clienteId);
    this.router.navigate(['/mvSystem/clientes/editar', clienteId]);
  }

  /**
   * Load all clients on component initialization
   */
  cargarTodosLosClientes() {
    this.isLoading = true;
    this.clientesService.getClientesPorNombreTelefono('')
      .subscribe({
        next: (clientes) => {
          this.listaClientes = clientes;
          this.isLoading = false;
          if (clientes.length > 0) {
            this.toastr.success(`Se cargaron ${clientes.length} cliente(s)`, "Clientes cargados");
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error("Error al cargar clientes", "Error");
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

}
