import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { merge } from 'rxjs';
import { LoginService } from 'src/app/auth/login.service';
import {
  DestinoRetirada, LaptopAccesorio, LaptopCambioHistorial, LaptopCambioPiezaRequest, LaptopCustodiaConfig, LaptopCustodiaPendiente, LaptopEquipo, TipoPieza
} from 'src/app/core/interfaces/laptop.interface';
import { LaptopsService } from 'src/app/core/services/laptops.service';
import { SeguridadService } from '../../seguridad/servicios/seguridad.service';

interface TecnicoItem {
  login: string;
  etiqueta: string;
}

@Component({
  selector: 'app-laptop-cambio-pieza',
  templateUrl: './laptop-cambio-pieza.component.html',
  styleUrls: ['./laptop-cambio-pieza.component.css']
})
export class LaptopCambioPiezaComponent implements OnInit {
  readonly tiposPieza: { valor: TipoPieza; texto: string }[] = [
    { valor: 'RAM', texto: 'Memoria RAM' },
    { valor: 'ALMACENAMIENTO', texto: 'Almacenamiento (SSD / HDD)' }
  ];
  readonly tiposPorPieza: { [key in TipoPieza]: string[] } = {
    RAM: ['DDR3', 'DDR4', 'DDR5'],
    ALMACENAMIENTO: ['SSD SATA', 'SSD NVMe', 'HDD']
  };
  readonly destinos: { valor: DestinoRetirada; texto: string }[] = [
    { valor: 'CUSTODIA', texto: 'Queda en custodia del técnico' },
    { valor: 'CLIENTE', texto: 'Se la lleva el cliente' }
  ];

  formBusqueda: FormGroup = this.fb.group({
    imei: ['', [Validators.required, Validators.maxLength(30)]]
  });

  formCambio: FormGroup = this.fb.group({
    tipoPieza: [null, Validators.required],
    accesorioInstalado: [null, Validators.required],
    capacidadGB: [null, [Validators.required, Validators.min(1), Validators.max(16000)]],
    tipoNuevo: [null, Validators.required],
    accesorioRetirado: [null],
    destinoRetirada: [null],
    tecnico: [null, Validators.required],
    // Solo se piden cuando el costo nuevo supera el precio de venta actual
    precioDetalle: [null],
    precioMayor: [null]
  });

  laptop: LaptopEquipo | null = null;
  accesoriosInstalar: LaptopAccesorio[] = [];
  accesoriosRetirar: LaptopAccesorio[] = [];
  tecnicos: TecnicoItem[] = [];
  historial: LaptopCambioHistorial[] = [];
  configCustodia: LaptopCustodiaConfig | null = null;
  vencidosTecnico: LaptopCustodiaPendiente[] = [];

  isLoading = false;
  isBuscando = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private laptopsService: LaptopsService,
    private seguridadService: SeguridadService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.cargarTecnicos();
    // Los precios sugeridos se recalculan siempre que cambie algo que afecte el costo nuevo
    merge(
      this.formCambio.get('accesorioInstalado')!.valueChanges,
      this.formCambio.get('accesorioRetirado')!.valueChanges,
      this.formCambio.get('destinoRetirada')!.valueChanges
    ).subscribe(() => this.sugerirPrecios());

    // Tarea 16: aviso (y bloqueo si está activo) cuando el técnico tiene piezas en custodia vencidas
    this.laptopsService.consultarConfiguracionCustodia().subscribe({
      next: (cfg) => this.configCustodia = cfg,
      error: () => { /* sin configuración solo se pierde el aviso; el SP valida igual */ }
    });
    this.formCambio.get('tecnico')!.valueChanges.subscribe((tecnico) => this.consultarVencidosTecnico(tecnico));
  }

  private consultarVencidosTecnico(tecnico: string | null) {
    this.vencidosTecnico = [];
    if (!tecnico) { return; }
    this.laptopsService.consultarPendientes(tecnico, null).subscribe({
      next: (lista) => {
        // Se ignora la respuesta si el técnico cambió mientras tanto
        if (this.formCambio.get('tecnico')?.value === tecnico) {
          this.vencidosTecnico = (lista || []).filter(p => p.vencido);
        }
      },
      error: () => this.vencidosTecnico = []
    });
  }

  get tecnicoBloqueado(): boolean {
    return !!this.configCustodia?.bloquearVencidos && this.vencidosTecnico.length > 0;
  }

  // ---------------------------------------------------------------
  // Getters de apoyo
  // ---------------------------------------------------------------
  get tipoPieza(): TipoPieza | null {
    return this.formCambio.get('tipoPieza')?.value;
  }

  get tiposNuevos(): string[] {
    return this.tipoPieza ? this.tiposPorPieza[this.tipoPieza] : [];
  }

  get instalada(): LaptopAccesorio | undefined {
    const id = this.formCambio.get('accesorioInstalado')?.value;
    return this.accesoriosInstalar.find(a => a.iD_Accesorio === id);
  }

  get retirada(): LaptopAccesorio | undefined {
    const id = this.formCambio.get('accesorioRetirado')?.value;
    return this.accesoriosRetirar.find(a => a.iD_Accesorio === id);
  }

  get hayRetirada(): boolean {
    return !!this.formCambio.get('accesorioRetirado')?.value;
  }

  get destino(): DestinoRetirada | null {
    return this.formCambio.get('destinoRetirada')?.value;
  }

  /** R4 / R10: si la pieza se queda en custodia se resta su costo; si se la lleva el cliente no. */
  get costoRetiradoDescontado(): number {
    return this.retirada && this.destino === 'CUSTODIA' ? Number(this.retirada.costo_Equipo) : 0;
  }

  get costoNuevo(): number {
    if (!this.laptop || !this.instalada) { return 0; }
    return Number(this.laptop.costo_Equipo) - this.costoRetiradoDescontado + Number(this.instalada.costo_Equipo);
  }

  /** El costo nuevo no puede quedar por encima del precio al detalle ni del precio por mayor. */
  get requierePrecios(): boolean {
    if (!this.laptop || !this.instalada) { return false; }
    return this.costoNuevo > Number(this.laptop.precio_Detalle) || this.costoNuevo > Number(this.laptop.precio_Por_Mayor);
  }

  get precioDetalleNuevo(): number | null {
    const v = this.formCambio.get('precioDetalle')?.value;
    return v === null || v === '' || v === undefined ? null : Number(v);
  }

  get precioMayorNuevo(): number | null {
    const v = this.formCambio.get('precioMayor')?.value;
    return v === null || v === '' || v === undefined ? null : Number(v);
  }

  get preciosValidos(): boolean {
    if (!this.requierePrecios) { return true; }
    const d = this.precioDetalleNuevo;
    const m = this.precioMayorNuevo;
    return d !== null && m !== null && d >= this.costoNuevo && m >= this.costoNuevo && m <= d;
  }

  get mensajePrecios(): string {
    const d = this.precioDetalleNuevo;
    const m = this.precioMayorNuevo;
    if (d === null || m === null) { return 'Indique el precio al detalle y el precio por mayor.'; }
    if (d < this.costoNuevo) { return 'El precio al detalle no puede ser menor que el costo nuevo.'; }
    if (m < this.costoNuevo) { return 'El precio por mayor no puede ser menor que el costo nuevo.'; }
    if (m > d) { return 'El precio por mayor no puede ser mayor que el precio al detalle.'; }
    return '';
  }

  get puedeConfirmar(): boolean {
    if (!this.laptop || !this.formCambio.valid) { return false; }
    if (this.hayRetirada && !this.destino) { return false; }
    if (!this.preciosValidos) { return false; }
    if (this.tecnicoBloqueado) { return false; }
    return true;
  }

  /**
   * Si el costo nuevo supera los precios actuales se sugieren precios nuevos que conservan
   * la misma ganancia en monto (precio actual + aumento del costo). El usuario puede ajustarlos.
   */
  sugerirPrecios() {
    const detalle = this.formCambio.get('precioDetalle');
    const mayor = this.formCambio.get('precioMayor');
    if (!this.laptop || !this.requierePrecios) {
      detalle?.setValue(null);
      mayor?.setValue(null);
      return;
    }
    // Precio sugerido = costo nuevo + ganancia actual (nunca menor a 0, por si el precio ya estaba bajo el costo)
    const costoActual = Number(this.laptop.costo_Equipo);
    const gananciaDetalle = Math.max(Number(this.laptop.precio_Detalle) - costoActual, 0);
    const gananciaMayor = Math.max(Number(this.laptop.precio_Por_Mayor) - costoActual, 0);
    const sugeridoDetalle = Math.ceil(this.costoNuevo + gananciaDetalle);
    const sugeridoMayor = Math.min(Math.ceil(this.costoNuevo + gananciaMayor), sugeridoDetalle);
    detalle?.setValue(sugeridoDetalle);
    mayor?.setValue(sugeridoMayor);
  }

  // ---------------------------------------------------------------
  // Búsqueda de la laptop
  // ---------------------------------------------------------------
  buscarLaptop() {
    const imei = (this.formBusqueda.get('imei')?.value || '').trim();
    if (!imei) {
      this.formBusqueda.get('imei')?.markAsTouched();
      return;
    }
    this.isBuscando = true;
    this.laptopsService.consultarEquipo(imei).subscribe({
      next: (equipos) => {
        this.isBuscando = false;
        const equipo = equipos && equipos.length ? equipos[0] : null;
        if (!equipo) {
          this.limpiarLaptop();
          this.toastr.error('El equipo no está registrado.');
          return;
        }
        if (!equipo.es_Laptop) {
          this.limpiarLaptop();
          this.toastr.error('El equipo no es una laptop.');
          return;
        }
        if (equipo.disponible !== 'S') {
          this.limpiarLaptop();
          this.toastr.error('La laptop no está disponible (vendida o no disponible). Solo se permiten cambios en laptops disponibles.');
          return;
        }
        this.laptop = equipo;
        this.resetFormCambio();
        this.cargarHistorial();
      },
      error: (err) => {
        this.isBuscando = false;
        this.toastr.error(this.mensajeError(err, 'Error al buscar el equipo.'));
      }
    });
  }

  private limpiarLaptop() {
    this.laptop = null;
    this.historial = [];
    this.accesoriosInstalar = [];
    this.accesoriosRetirar = [];
    this.resetFormCambio();
  }

  nuevaBusqueda() {
    this.formBusqueda.reset({ imei: '' });
    this.limpiarLaptop();
  }

  // ---------------------------------------------------------------
  // Selección de pieza
  // ---------------------------------------------------------------
  onTipoPiezaChange() {
    this.formCambio.get('capacidadGB')?.enable({ emitEvent: false });
    this.formCambio.get('tipoNuevo')?.enable({ emitEvent: false });
    this.formCambio.patchValue({
      accesorioInstalado: null,
      capacidadGB: null,
      tipoNuevo: null,
      accesorioRetirado: null,
      destinoRetirada: null,
      precioDetalle: null,
      precioMayor: null
    });
    this.cargarAccesorios();
  }

  private cargarAccesorios() {
    this.accesoriosInstalar = [];
    this.accesoriosRetirar = [];
    if (!this.laptop || !this.tipoPieza) { return; }
    const tipo = this.tipoPieza;
    const almacen = this.laptop.iD_Almacen;

    // Pieza instalada: solo con existencia en el almacén de la laptop
    this.laptopsService.consultarAccesorios(almacen, tipo, true).subscribe({
      next: (lista) => this.accesoriosInstalar = this.conEtiqueta(lista),
      error: (err) => this.toastr.error(this.mensajeError(err, 'Error al cargar los accesorios.'))
    });
    // Pieza retirada: cualquier componente del catálogo
    this.laptopsService.consultarAccesorios(almacen, tipo, false).subscribe({
      next: (lista) => this.accesoriosRetirar = this.conEtiqueta(lista),
      error: (err) => this.toastr.error(this.mensajeError(err, 'Error al cargar los accesorios.'))
    });
  }

  private conEtiqueta(lista: LaptopAccesorio[]): LaptopAccesorio[] {
    return (lista || []).map(a => ({
      ...a,
      etiqueta: `${a.modelo} · ${a.descripcion_Accesorio} (stock ${a.cantidad})`
    }));
  }

  /** Al elegir el accesorio instalado se sugiere la capacidad a partir de su descripción (ej. "8GB 3200"). */
  /**
   * La capacidad y el tipo salen del accesorio elegido (descripción "12GB 3200", modelo "RAM DDR4 SODIMM").
   * Si se detectan quedan bloqueados para que la configuración coincida con la pieza instalada;
   * si no se detectan, se habilitan para escribirlos a mano.
   */
  onAccesorioInstaladoChange() {
    const capacidad = this.formCambio.get('capacidadGB');
    const tipo = this.formCambio.get('tipoNuevo');
    capacidad?.enable({ emitEvent: false });
    tipo?.enable({ emitEvent: false });
    capacidad?.setValue(null);
    tipo?.setValue(null);

    const acc = this.instalada;
    if (!acc) { return; }

    const m = /(\d+(?:[.,]\d+)?)\s*(TB|GB)/i.exec(acc.descripcion_Accesorio || '');
    if (m) {
      const valor = parseFloat(m[1].replace(',', '.'));
      const gb = m[2].toUpperCase() === 'TB' ? Math.round(valor * 1024) : Math.round(valor);
      capacidad?.setValue(gb);
      capacidad?.disable({ emitEvent: false });
    }

    // Tipo según el modelo del accesorio (ej. "RAM DDR4 SODIMM", "SSD M.2 NVMe")
    const modelo = (acc.modelo || '').toUpperCase();
    const detectado = this.tiposNuevos.find(t => modelo.includes(t.toUpperCase()))
      || (modelo.includes('NVME') ? 'SSD NVMe' : (modelo.includes('SSD') ? 'SSD SATA' : (modelo.includes('HDD') ? 'HDD' : undefined)));
    if (detectado && this.tiposNuevos.includes(detectado)) {
      tipo?.setValue(detectado);
      tipo?.disable({ emitEvent: false });
    }
  }

  onAccesorioRetiradoChange() {
    const destinoCtrl = this.formCambio.get('destinoRetirada');
    if (this.hayRetirada) {
      destinoCtrl?.setValidators(Validators.required);
      if (!destinoCtrl?.value) { destinoCtrl?.setValue('CUSTODIA'); }
    } else {
      destinoCtrl?.clearValidators();
      destinoCtrl?.setValue(null);
    }
    destinoCtrl?.updateValueAndValidity();
  }

  // ---------------------------------------------------------------
  // Confirmación
  // ---------------------------------------------------------------
  confirmarCambio() {
    if (!this.laptop || !this.puedeConfirmar) {
      this.formCambio.markAllAsTouched();
      const faltantes = this.camposFaltantes();
      this.toastr.error(
        faltantes.length ? `Falta completar: ${faltantes.join(', ')}.` : 'Complete los campos requeridos.',
        '',
        { closeButton: true, progressBar: true }
      );
      return;
    }
    const f = this.formCambio.getRawValue(); // incluye los campos bloqueados (capacidad y tipo detectados)
    const cambio: LaptopCambioPiezaRequest = {
      imei: this.laptop.imei,
      tipo_Pieza: f.tipoPieza,
      iD_Accesorio_Instalado: Number(f.accesorioInstalado),
      nueva_Capacidad_GB: Number(f.capacidadGB),
      nuevo_Tipo: f.tipoNuevo,
      iD_Accesorio_Retirado: f.accesorioRetirado ? Number(f.accesorioRetirado) : null,
      destino_Retirada: f.accesorioRetirado ? f.destinoRetirada : null,
      tecnico: f.tecnico,
      iD_Almacen: this.laptop.iD_Almacen,
      nuevo_Precio_Detalle: this.requierePrecios ? this.precioDetalleNuevo : null,
      nuevo_Precio_Por_Mayor: this.requierePrecios ? this.precioMayorNuevo : null,
      usuario: this.loginService.getUserName()
    };

    this.isLoading = true;
    this.laptopsService.registrarCambioPieza(cambio).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Cambio de pieza registrado satisfactoriamente.');
        // Se refrescan los datos de la laptop (costo y configuración nuevos), el historial y las existencias
        this.laptopsService.consultarEquipo(cambio.imei).subscribe(eq => {
          if (eq && eq.length) { this.laptop = eq[0]; }
        });
        this.resetFormCambio();
        this.cargarHistorial();
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(this.mensajeError(err, 'No se pudo registrar el cambio de pieza.'), '', {
          closeButton: true,
          progressBar: true,
        });
      }
    });
  }

  /** Nombres de los campos que impiden confirmar, para avisar al usuario. */
  private camposFaltantes(): string[] {
    const etiquetas: { campo: string; texto: string }[] = [
      { campo: 'tipoPieza', texto: 'Tipo de pieza' },
      { campo: 'accesorioInstalado', texto: 'Pieza que se instala' },
      { campo: 'capacidadGB', texto: 'Capacidad nueva' },
      { campo: 'tipoNuevo', texto: 'Tipo de la pieza' },
      { campo: 'tecnico', texto: 'Técnico' }
    ];
    const faltantes = etiquetas
      .filter(e => {
        const c = this.formCambio.get(e.campo);
        return !!c && c.enabled && c.invalid;
      })
      .map(e => e.texto);
    if (this.hayRetirada && !this.destino) {
      faltantes.push('Destino de la pieza retirada');
    }
    if (!this.preciosValidos) {
      faltantes.push(`Precios de venta (${this.mensajePrecios.replace(/\.$/, '')})`);
    }
    return faltantes;
  }

  private resetFormCambio() {
    this.formCambio.get('capacidadGB')?.enable({ emitEvent: false });
    this.formCambio.get('tipoNuevo')?.enable({ emitEvent: false });
    this.formCambio.reset({
      tipoPieza: null, accesorioInstalado: null, capacidadGB: null, tipoNuevo: null,
      accesorioRetirado: null, destinoRetirada: null, tecnico: null, precioDetalle: null, precioMayor: null
    });
    this.formCambio.get('destinoRetirada')?.clearValidators();
    this.formCambio.get('destinoRetirada')?.updateValueAndValidity();
    this.accesoriosInstalar = [];
    this.accesoriosRetirar = [];
  }

  // ---------------------------------------------------------------
  // Historial y catálogos
  // ---------------------------------------------------------------
  cargarHistorial() {
    if (!this.laptop) { return; }
    this.laptopsService.consultarHistorial(this.laptop.imei).subscribe({
      next: (h) => this.historial = h || [],
      error: (err) => this.toastr.error(this.mensajeError(err, 'Error al cargar el historial.'))
    });
  }

  private cargarTecnicos() {
    this.seguridadService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.tecnicos = (usuarios || [])
          .filter(u => u.estado === 1 && u.login)
          .map(u => ({ login: u.login, etiqueta: `${u.nombre} (${u.login})` }));
      },
      error: () => this.toastr.error('No se pudo cargar la lista de técnicos.')
    });
  }

  claseCustodia(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'bg-warning text-dark';
      case 'RECIBIDA': return 'bg-success';
      case 'ENTREGADA_CLIENTE': return 'bg-info text-dark';
      default: return 'bg-secondary';
    }
  }

  campoInvalido(campo: string): boolean {
    const c = this.formCambio.get(campo);
    return !!c && c.invalid && c.touched;
  }

  private mensajeError(err: any, porDefecto: string): string {
    // El interceptor de errores devuelve el mensaje del API como texto en los 400
    if (typeof err === 'string' && err) { return err; }
    const e = err?.error;
    if (typeof e === 'string' && e) { return e; }
    if (e?.message) { return e.message; }
    return porDefecto;
  }
}
