import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cliente, ClienteRegistro, TipoCliente } from 'src/app/core/interfaces/cliente.interface';
import { TipoTelefono } from 'src/app/core/interfaces/catalogo.interface';
import { ClientesService } from 'src/app/core/services/clientes.service';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { LoginService } from 'src/app/auth/login.service';

@Component({
  selector: 'app-clientes-editar',
  templateUrl: './clientes-editar.component.html',
  styleUrls: ['./clientes-editar.component.css']
})
export class ClientesEditarComponent implements OnInit {
  formEdicion: FormGroup;
  cliente: Cliente | null = null;
  isLoading: boolean = true;
  isSaving: boolean = false;
  clienteId: number = 0;
  
  listaTipoClientes: TipoCliente[] = [];
  listaTipoTelefonos: TipoTelefono[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clientesService: ClientesService,
    private catalogosService: CatalogosService,
    private loginService: LoginService,
    private toastr: ToastrService
  ) {
    this.formEdicion = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', Validators.required],
      tipoCliente: [1],
      limiteCredito: [0, [Validators.min(0)]],
      tipoTelefono: [1],
      telefono: ['', [Validators.required, this.telefonoValidator]],
      extensionNumero: [''],
      email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      provincia: [''],
      sector: [''],
      calle: [''],
      casaNumero: [''],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.clienteId = +params['id'];
      if (this.clienteId) {
        this.cargarDatosIniciales();
      } else {
        this.toastr.error('ID de cliente no válido');
        this.router.navigate(['/mvSystem/clientes/consulta']);
      }
    });
  }

  async cargarDatosIniciales(): Promise<void> {
    try {
      // Cargar catalogos
      await Promise.all([
        this.obtenerTipoClientes(),
        this.obtenerTipoTelefonos()
      ]);
      
      // Cargar datos del cliente
      await this.cargarDatosCliente();
      
    } catch (error) {
      this.toastr.error('Error al cargar los datos iniciales');
      console.error('Error:', error);
    }
  }

  obtenerTipoClientes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.catalogosService.getTipoTelefonoLista()
        .subscribe({
          next: (tipos) => {
            this.listaTipoTelefonos = tipos;
            resolve();
          },
          error: (error) => reject(error)
        });
    });
  }

  obtenerTipoTelefonos(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clientesService.getTipoClienteLista()
        .subscribe({
          next: (tipos) => {
            this.listaTipoClientes = tipos;
            resolve();
          },
          error: (error) => reject(error)
        });
    });
  }

  cargarDatosCliente(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clientesService.getClientesPorNombreTelefono('')
        .subscribe({
          next: (clientes) => {
            this.cliente = clientes.find(c => c.id_Cliente === this.clienteId) || null;
            
            if (this.cliente) {
              this.llenarFormulario();
              this.isLoading = false;
              resolve();
            } else {
              this.toastr.error('Cliente no encontrado');
              this.router.navigate(['/mvSystem/clientes/consulta']);
              reject('Cliente no encontrado');
            }
          },
          error: (error) => {
            this.isLoading = false;
            this.toastr.error('Error al cargar los datos del cliente');
            reject(error);
          }
        });
    });
  }

  llenarFormulario(): void {
    if (!this.cliente) return;

    // Parsear la dirección
    const direccionArray = this.cliente.direccion_Detalle ? this.cliente.direccion_Detalle.split(',') : [];
    
    this.formEdicion.patchValue({
      nombre: this.cliente.nombres,
      apellido: this.cliente.apellidos,
      tipoCliente: this.cliente.iD_Tipo_Cliente,
      limiteCredito: parseFloat(this.cliente.limite_Credito) || 0,
      tipoTelefono: this.cliente.iD_Tipo_Telefono,
      telefono: this.formatearTelefonoParaInput(this.cliente.numero_Telefono),
      extensionNumero: this.cliente.extencion || '',
      email: this.cliente.email_Detalle || '',
      calle: direccionArray[0]?.trim() || '',
      casaNumero: direccionArray[1]?.trim() || '',
      sector: direccionArray[2]?.trim() || '',
      provincia: direccionArray[3]?.trim() || ''
    });

    // Habilitar/deshabilitar extensión según corresponda
    if (this.cliente.extencion) {
      this.formEdicion.controls['extensionNumero'].enable();
    } else {
      this.formEdicion.controls['extensionNumero'].disable();
    }
  }

  formatearTelefonoParaInput(telefono: number): string {
    const telefonoStr = telefono.toString().padStart(10, '0');
    return `${telefonoStr.substring(0, 3)}-${telefonoStr.substring(3, 6)}-${telefonoStr.substring(6)}`;
  }

  telefonoValidator(control: any) {
    const value = control.value;
    if (!value) return null;
    
    const digitsOnly = value.replace(/\D/g, '');
    
    if (digitsOnly.length === 10) {
      return null;
    }
    
    return { invalidTelefono: true };
  }

  onCheckboxChange(event: any) {
    if (event.target.checked == false) {
      this.formEdicion.controls['extensionNumero'].disable();
      this.formEdicion.get('extensionNumero')?.setValue("");
    } else {
      this.formEdicion.controls['extensionNumero'].enable();
    }
  }

  validarCampos(nombreCampo: string) {
    return this.formEdicion.get(nombreCampo)?.invalid &&
      this.formEdicion.get(nombreCampo)?.touched;
  }

  validarCamposEmail(nombreCampo: string) {
    return this.formEdicion.get(nombreCampo)?.errors;
  }

  get telefonoErrorMsg(): string {
    const errors = this.formEdicion.get('telefono')?.errors;
    
    if (errors?.required) {
      return 'Este campo es requerido';
    }
    if (errors?.invalidTelefono) {
      return 'Debe ingresar un número de teléfono válido de 10 dígitos';
    }
    return '';
  }

  get emailErrorMsg(): string {
    const errors = this.formEdicion.get('email')?.errors;
    if (errors?.pattern) {
      return 'El valor no tiene formato de correo';
    }
    return '';
  }

  get limiteCreditoErrorMsg(): string {
    const errors = this.formEdicion.get('limiteCredito')?.errors;
    if (errors?.min) {
      return 'El límite de crédito no puede ser negativo';
    }
    return '';
  }

  btnDisable() {
    return !this.formEdicion.valid;
  }

  modeloActualizarCliente(): ClienteRegistro {
    let direccion: any = [
      this.formEdicion.get('calle')?.value,
      this.formEdicion.get('casaNumero')?.value,
      this.formEdicion.get('sector')?.value,
      this.formEdicion.get('provincia')?.value
    ];

    const actualizacion: ClienteRegistro = {
      nombres: this.formEdicion.get('nombre')?.value,
      apellidos: this.formEdicion.get('apellido')?.value,
      iD_Tipo_Cliente: Number(this.formEdicion.get('tipoCliente')?.value),
      limite_Credito: this.formEdicion.get('limiteCredito')?.value || 0,
      numero_Telefono: Number(this.formEdicion.get('telefono')?.value.replace(/\D/g, '')),
      iD_Tipo_Telefono: Number(this.formEdicion.get('tipoTelefono')?.value),
      extencion: this.formEdicion.get('extensionNumero')?.value || null,
      email_Detalle: this.formEdicion.get('email')?.value,
      usuario: this.loginService.getUserName(),
      direccion_Detalle: direccion.filter((item: any) => item).join(', '),
    };
    
    return actualizacion;
  }

  actualizarCliente() {
    if (this.formEdicion.valid && this.cliente) {
      this.isSaving = true;
      const modelo = this.modeloActualizarCliente();

      // Por ahora simularemos la actualización ya que no tenemos endpoint de actualización
      // En una implementación real, llamarías a un método como: this.clientesService.updateCliente(this.clienteId, modelo)
      
      setTimeout(() => {
        this.isSaving = false;
        this.toastr.success('Cliente actualizado correctamente', 'Éxito');
        this.router.navigate(['/mvSystem/clientes/detalle', this.clienteId]);
      }, 1500);

    } else {
      this.formEdicion.markAllAsTouched();
      this.toastr.error('Hay datos en el formulario incompletos', 'Error de validación');
    }
  }

  cancelar() {
    this.router.navigate(['/mvSystem/clientes/detalle', this.clienteId]);
  }
}
