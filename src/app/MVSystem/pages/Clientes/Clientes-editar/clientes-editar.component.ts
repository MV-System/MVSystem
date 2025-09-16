import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cliente, ClienteRegistro, TipoCliente, ClienteActualizacion } from 'src/app/core/interfaces/cliente.interface';
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
        this.router.navigateByUrl('/home/clientes/consulta');
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
            this.cliente = clientes.find(c => (c.Id_Cliente || c.id_Cliente) === this.clienteId) || null;
            
            if (this.cliente) {
              this.llenarFormulario();
              this.isLoading = false;
              resolve();
            } else {
              this.toastr.error('Cliente no encontrado');
              this.router.navigateByUrl('/home/clientes/consulta');
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
    const direccionArray = this.getClienteDireccion() ? this.getClienteDireccion().split(',') : [];
    
    this.formEdicion.patchValue({
      nombre: this.getClienteNombres(),
      apellido: this.getClienteApellidos(),
      tipoCliente: this.getClienteTipoId(),
      limiteCredito: parseFloat(this.getClienteLimiteCredito()) || 0,
      tipoTelefono: this.getClienteTipoTelefonoId(),
      telefono: this.formatearTelefonoParaInput(this.getClienteTelefono()),
      extensionNumero: this.getClienteExtencion() || '',
      email: this.getClienteEmail() || '',
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

  modeloActualizarCliente(): ClienteActualizacion {
    let direccion: any = [
      this.formEdicion.get('calle')?.value,
      this.formEdicion.get('casaNumero')?.value,
      this.formEdicion.get('sector')?.value,
      this.formEdicion.get('provincia')?.value
    ];

    const actualizacion: ClienteActualizacion = {
      ID_Cliente: this.clienteId,                                           // REQUERIDO
      Nombres: this.formEdicion.get('nombre')?.value,                       // REQUERIDO
      Apellidos: this.formEdicion.get('apellido')?.value,                   // REQUERIDO
      ID_Tipo_Cliente: Number(this.formEdicion.get('tipoCliente')?.value),  // REQUERIDO
      Numero_Telefono: Number(this.formEdicion.get('telefono')?.value.replace(/\D/g, '')), // REQUERIDO
      ID_Tipo_Telefono: Number(this.formEdicion.get('tipoTelefono')?.value), // REQUERIDO
      Direccion_Detalle: direccion.filter((item: any) => item).join(', '),  // REQUERIDO
      Usuario: this.loginService.getUserName(),                             // REQUERIDO
      Limite_Credito: this.formEdicion.get('limiteCredito')?.value || '0',  // OPCIONAL
      Extencion: this.formEdicion.get('extensionNumero')?.value || null,    // OPCIONAL
      Email_Detalle: this.formEdicion.get('email')?.value || '',            // OPCIONAL
    };
    
    return actualizacion;
  }

  actualizarCliente() {
    if (this.formEdicion.valid && this.cliente) {
      this.isSaving = true;
      const modelo = this.modeloActualizarCliente();

      console.log('Modelo de actualización a enviar:', modelo);

      // Llamar al servicio de actualización
      this.clientesService.putCliente(modelo)
        .subscribe({
          next: (response) => {
            this.isSaving = false;
            console.log('Cliente actualizado exitosamente:', response);
            this.toastr.success('Cliente actualizado correctamente', 'Éxito');
            this.router.navigateByUrl(`/home/clientes/detalle/${this.clienteId}`);
          },
          error: (error) => {
            this.isSaving = false;
            console.error('Error al actualizar cliente:', error);
            this.toastr.error('Error al actualizar el cliente. Intente nuevamente.', 'Error');
          }
        });

    } else {
      this.formEdicion.markAllAsTouched();
      this.toastr.error('Hay datos en el formulario incompletos', 'Error de validación');
    }
  }

  cancelar() {
    this.router.navigateByUrl(`/home/clientes/detalle/${this.clienteId}`);
  }

  /**
   * Helper methods for data compatibility between old and new API format
   */
  getClienteId(): number {
    return this.cliente?.Id_Cliente || this.cliente?.id_Cliente || (this.cliente as any)?.id_cliente || 0;
  }

  getClienteNombres(): string {
    return this.cliente?.Nombres || this.cliente?.nombres || (this.cliente as any)?.nombre || '';
  }

  getClienteApellidos(): string {
    return this.cliente?.Apellidos || this.cliente?.apellidos || (this.cliente as any)?.apellido || '';
  }

  getClienteTelefono(): number {
    return this.cliente?.Numero_de_telefono || this.cliente?.numero_Telefono || (this.cliente as any)?.numero_de_telefono || 0;
  }

  getClienteEmail(): string {
    return this.cliente?.Email || this.cliente?.email_Detalle || (this.cliente as any)?.email || '';
  }

  getClienteTipoDescripcion(): string {
    return this.cliente?.Tipo_de_Cliente || this.cliente?.tipo_Cliente_Descripcion || (this.cliente as any)?.tipo_de_cliente || '';
  }

  getClienteLimiteCredito(): string {
    return this.cliente?.Limite_Credito || this.cliente?.limite_Credito || (this.cliente as any)?.limite_credito || '0';
  }

  getClienteDireccion(): string {
    return this.cliente?.Direccion || this.cliente?.direccion_Detalle || (this.cliente as any)?.direccion || '';
  }

  getClienteExtencion(): number | null {
    return this.cliente?.Extencion || this.cliente?.extencion || (this.cliente as any)?.extension || null;
  }

  getClienteTipoId(): number {
    return this.cliente?.iD_Tipo_Cliente || (this.cliente as any)?.id_tipo_cliente || (this.cliente as any)?.tipo_cliente_id || 1;
  }

  getClienteTipoTelefonoId(): number {
    return this.cliente?.iD_Tipo_Telefono || (this.cliente as any)?.id_tipo_telefono || (this.cliente as any)?.tipo_telefono_id || 1;
  }
}
