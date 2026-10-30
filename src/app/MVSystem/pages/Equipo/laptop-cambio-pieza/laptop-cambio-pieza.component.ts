import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { merge } from 'rxjs';
import { LoginService } from 'src/app/auth/login.service';
import {
  DestinoRetirada, LaptopAccesorio, LaptopCambioHistorial, LaptopCambioPiezaRequest, LaptopCustodiaConfig, LaptopCustodiaPendiente, LaptopEquipo, LaptopModulo, ModeloComponente, TipoPieza
} from 'src/app/core/interfaces/laptop.interface';
import { LaptopsService } from 'src/app/core/services/laptops.service';
import { ImprimirPdfBlob } from 'src/app/helpers/helper';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';
import { SeguridadService } from '../../seguridad/servicios/seguridad.service';

interface TecnicoItem {
  login: string;
  etiqueta: string;
}

/** Opción de "Pieza que se retira": un módulo instalado en la laptop, o "Ninguna" (slot libre, id 0). */
interface OpcionRetirada {
  id: number;
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
    // Módulo de la laptop que sale (id) o 0 = "Ninguna (slot libre)"; null = aún sin elegir
    moduloRetirado: [null, Validators.required],
    destinoRetirada: [null],
    tecnico: [null, Validators.required],
    // Solo se piden cuando el costo nuevo supera el precio de venta actual
    precioDetalle: [null],
    precioMayor: [null]
  });

  laptop: LaptopEquipo | null = null;
  modulos: LaptopModulo[] = [];
  modelosComponente: ModeloComponente[] = [];
  accesoriosInstalarTodos: LaptopAccesorio[] = [];
  accesoriosInstalar: LaptopAccesorio[] = [];
  accesoriosRetirar: LaptopAccesorio[] = [];
  opcionesRetirada: OpcionRetirada[] = [];
  tecnicos: TecnicoItem[] = [];
  historial: LaptopCambioHistorial[] = [];
  configCustodia: LaptopCustodiaConfig | null = null;
  vencidosTecnico: LaptopCustodiaPendiente[] = [];
  porcentajeCostoUsado = 50;
  cambioAnular: LaptopCambioHistorial | null = null;

  // Comprobante de custodia: se ofrece al registrar un cambio cuya pieza retirada queda en custodia
  comprobante: { idCambio: number; tecnicoNombre: string } | null = null;
  isImprimiendo = false;

  isLoading = false;
  isBuscando = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private laptopsService: LaptopsService,
    private seguridadService: SeguridadService,
    private loginService: LoginService,
    private validatorPermissionService: ValidatorPermissionService
  ) { }

  ngOnInit(): void {
    this.cargarTecnicos();
    this.laptopsService.consultarModelosComponente().subscribe({
      next: (modelos) => { this.modelosComponente = modelos || []; this.refiltrarInstalables(); },
      error: (err) => this.toastr.error(this.mensajeError(err, 'Error al cargar los modelos de componentes.'))
    });

    // Los precios sugeridos se recalculan siempre que cambie algo que afecte el costo nuevo
    merge(
      this.formCambio.get('accesorioInstalado')!.valueChanges,
      this.formCambio.get('moduloRetirado')!.valueChanges,
      this.formCambio.get('destinoRetirada')!.valueChanges
    ).subscribe(() => this.sugerirPrecios());

    // Tarea 16: aviso (y bloqueo si está activo) cuando el técnico tiene piezas en custodia vencidas
    this.laptopsService.consultarConfiguracionCustodia().subscribe({
      next: (cfg) => { this.configCustodia = cfg; this.porcentajeCostoUsado = cfg.porcentajeCostoUsado ?? 50; },
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

  /** Nombre del técnico sin el " (login)" de la etiqueta de la lista. */
  private nombreTecnico(login: string): string {
    const etiqueta = this.tecnicos.find(t => t.login === login)?.etiqueta || login;
    return etiqueta.replace(/\s*\([^)]*\)\s*$/, '');
  }

  imprimirComprobante() {
    if (!this.comprobante || this.isImprimiendo) { return; }
    this.isImprimiendo = true;
    this.laptopsService.obtenerComprobanteCustodia(
      this.comprobante.idCambio,
      this.loginService.getUserIdEmpresa,
      this.loginService.getUserIdSucursal,
      this.comprobante.tecnicoNombre
    ).subscribe({
      next: (blob) => {
        this.isImprimiendo = false;
        if (!blob || blob.size === 0) {
          this.toastr.warning('El comprobante está vacío.');
          return;
        }
        ImprimirPdfBlob(blob);
        this.comprobante = null;
      },
      error: () => {
        this.isImprimiendo = false;
        this.toastr.warning('No se pudo generar el comprobante de custodia.');
      }
    });
  }

  get puedeAnular(): boolean {
    return this.validatorPermissionService.validateUserRole('LAPTOP_CAMBIO_ANULAR');
  }

  /** Tras anular se refrescan la laptop (costo y configuracion), sus modulos, el historial y las existencias. */
  alAnular() {
    this.cambioAnular = null;
    if (!this.laptop) { return; }
    const imei = this.laptop.imei;
    this.laptopsService.consultarEquipo(imei).subscribe(eq => {
      if (eq && eq.length) { this.laptop = eq[0]; }
    });
    this.resetFormCambio();
    this.cargarModulos();
    this.cargarHistorial();
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

  get instalada(): LaptopAccesorio | undefined {
    const id = this.formCambio.get('accesorioInstalado')?.value;
    return this.accesoriosInstalar.find(a => a.iD_Accesorio === id);
  }

  /** Módulos activos de la laptop del tipo de pieza elegido. */
  get modulosDelTipo(): LaptopModulo[] {
    return this.modulos.filter(m => m.tipo_Pieza === this.tipoPieza);
  }

  /** Módulo que sale (null si se eligió "Ninguna" o aún no se eligió). */
  get moduloRetirado(): LaptopModulo | null {
    const id = Number(this.formCambio.get('moduloRetirado')?.value);
    return id > 0 ? this.modulos.find(m => m.iD_Modulo === id) || null : null;
  }

  get hayRetirada(): boolean {
    return !!this.moduloRetirado;
  }

  get destino(): DestinoRetirada | null {
    return this.formCambio.get('destinoRetirada')?.value;
  }

  private esPiezaUsada(a: LaptopAccesorio): boolean {
    return /(usado)s*$/i.test(a.descripcion_Accesorio || '');
  }

  /**
   * Costo de la pieza que sale (igual que el SP). La pieza retirada es USADA:
   *  - si el accesorio del módulo ya es una pieza usada, su propio costo;
   *  - si existe la variante usada del mismo modelo y capacidad, su costo;
   *  - si no, el % configurado (Laptops:PorcentajeCostoUsado) del costo de la pieza nueva.
   * null = no hay forma de saberlo (la pieza no está en el catálogo): el SP la crea con costo 0.
   */
  get costoRetirada(): number | null {
    const m = this.moduloRetirado;
    if (!m) { return null; }
    const lista = this.accesoriosRetirar;
    const delModulo = lista.find(a => a.iD_Accesorio === m.iD_Accesorio);
    if (delModulo && this.esPiezaUsada(delModulo)) { return Number(delModulo.costo_Equipo); }
    const mismoModeloYCapacidad = (a: LaptopAccesorio) =>
      a.modelo === m.modelo_Componente && this.capacidadDeDescripcion(a.descripcion_Accesorio) === m.capacidad_GB;
    const usada = lista.find(a => this.esPiezaUsada(a) && mismoModeloYCapacidad(a));
    if (usada) { return Number(usada.costo_Equipo); }
    const nueva = delModulo || lista.find(a => !this.esPiezaUsada(a) && mismoModeloYCapacidad(a));
    return nueva ? Math.round(Number(nueva.costo_Equipo) * this.porcentajeCostoUsado) / 100 : null;
  }

  /** R4 / R10: si la pieza se queda en custodia se resta su costo (de pieza usada); si se la lleva el cliente no. */
  get costoRetiradoDescontado(): number {
    return this.destino === 'CUSTODIA' ? (this.costoRetirada || 0) : 0;
  }

  /** La pieza que sale no está en el catálogo o no tiene costo: no se descuenta de la laptop. */
  get retiradaSinCosto(): boolean {
    return this.hayRetirada && this.destino === 'CUSTODIA' && !(this.costoRetirada && this.costoRetirada > 0);
  }

  get costoNuevo(): number {
    if (!this.laptop || !this.instalada) { return 0; }
    return Number(this.laptop.costo_Equipo) - this.costoRetiradoDescontado + Number(this.instalada.costo_Equipo);
  }

  /** Capacidad de la pieza que se instala, leída de su descripción (igual que el SP). */
  get capacidadInstalada(): number | null {
    return this.instalada ? this.capacidadDeDescripcion(this.instalada.descripcion_Accesorio) : null;
  }

  /** Tipo (DDR4, SSD SATA...) de la pieza que se instala, según su modelo. */
  get tipoInstalada(): string | null {
    const modelo = this.instalada?.modelo;
    return this.modelosComponente.find(m => m.descripcion === modelo)?.tipo || null;
  }

  /** Tipo de RAM que ya tiene la laptop (no se mezclan DDR3 / DDR4 / DDR5). */
  get tipoRamLaptop(): string | null {
    return this.modulos.find(m => m.tipo_Pieza === 'RAM')?.tipo || null;
  }

  /** Línea calculada antes/después de la configuración del tipo de pieza elegido. */
  get resumenConfiguracion(): { antes: string; despues: string } | null {
    if (!this.tipoPieza || !this.instalada || this.capacidadInstalada === null) { return null; }
    const antes = this.modulosDelTipo.map(m => ({ gb: m.capacidad_GB, texto: this.textoModulo(m.capacidad_GB, m.tipo) }));
    const retirado = this.moduloRetirado;
    const despues = antes.filter((_, i) => !retirado || this.modulosDelTipo[i].iD_Modulo !== retirado.iD_Modulo);
    despues.push({ gb: this.capacidadInstalada, texto: this.textoModulo(this.capacidadInstalada, this.tipoInstalada || '') });
    return { antes: this.formatoLista(antes), despues: this.formatoLista(despues) };
  }

  /** En discos se puede cambiar de modelo (SATA / M.2 / NVMe) pero la laptop podría no tener esa ranura. */
  get avisoRanura(): string {
    if (this.tipoPieza !== 'ALMACENAMIENTO' || !this.moduloRetirado || !this.instalada) { return ''; }
    return this.instalada.modelo !== this.moduloRetirado.modelo_Componente
      ? `Verifique que la laptop tenga ranura para ${this.instalada.modelo}.`
      : '';
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
    if (this.instalada && this.capacidadInstalada === null) { return false; }
    if (!this.preciosValidos) { return false; }
    if (this.tecnicoBloqueado) { return false; }
    return true;
  }

  /** Igual que fn_Componente_Capacidad_GB: primer número seguido de GB o TB (TB × 1024). */
  private capacidadDeDescripcion(descripcion: string): number | null {
    const m = /(\d+(?:[.,]\d+)?)\s*(TB|GB)\b/i.exec(descripcion || '');
    if (!m) { return null; }
    const valor = parseFloat(m[1].replace(',', '.'));
    return Math.round(m[2].toUpperCase() === 'TB' ? valor * 1024 : valor);
  }

  private textoCapacidad(gb: number): string {
    return gb >= 1024 && gb % 1024 === 0 ? `${gb / 1024}TB` : `${gb}GB`;
  }

  private textoModulo(gb: number, tipo: string): string {
    return `${this.textoCapacidad(gb)} ${tipo}`.trim();
  }

  /** RAM: "8+8 = 16GB DDR4"; discos: "256GB SSD SATA + 1TB HDD". */
  private formatoLista(piezas: { gb: number; texto: string }[]): string {
    if (!piezas.length) { return 'Sin piezas'; }
    if (this.tipoPieza === 'RAM') {
      const total = piezas.reduce((t, p) => t + p.gb, 0);
      const tipo = piezas[0].texto.replace(/^\S+\s*/, '');
      return `${piezas.map(p => p.gb).join('+')} = ${total}GB ${tipo}`.trim();
    }
    return piezas.map(p => p.texto).join(' + ');
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
        this.cargarModulos();
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
    this.modulos = [];
    this.accesoriosInstalarTodos = [];
    this.accesoriosInstalar = [];
    this.accesoriosRetirar = [];
    this.opcionesRetirada = [];
    this.resetFormCambio();
  }

  nuevaBusqueda() {
    this.formBusqueda.reset({ imei: '' });
    this.limpiarLaptop();
  }

  private cargarModulos() {
    if (!this.laptop) { return; }
    this.laptopsService.consultarModulos(this.laptop.imei).subscribe({
      next: (lista) => {
        this.modulos = lista || [];
        this.armarOpcionesRetirada();
        this.refiltrarInstalables();
      },
      error: (err) => this.toastr.error(this.mensajeError(err, 'Error al cargar la configuración de la laptop.'))
    });
  }

  // ---------------------------------------------------------------
  // Selección de pieza
  // ---------------------------------------------------------------
  onTipoPiezaChange() {
    this.formCambio.patchValue({
      accesorioInstalado: null,
      moduloRetirado: null,
      destinoRetirada: null,
      precioDetalle: null,
      precioMayor: null
    });
    this.armarOpcionesRetirada();
    this.cargarAccesorios();
    // Si la laptop tiene un solo módulo de ese tipo, queda preseleccionado
    if (this.modulosDelTipo.length === 1) {
      this.formCambio.get('moduloRetirado')?.setValue(this.modulosDelTipo[0].iD_Modulo);
      this.onModuloRetiradoChange();
    }
  }

  /** "Pieza que se retira": los módulos de la laptop del tipo elegido + "Ninguna (slot libre)". */
  private armarOpcionesRetirada() {
    const modulos = this.modulosDelTipo.map(m => ({
      id: m.iD_Modulo,
      etiqueta: `${this.textoCapacidad(m.capacidad_GB)} · ${m.modelo_Componente} (${m.tipo})`
    }));
    this.opcionesRetirada = this.tipoPieza ? [...modulos, { id: 0, etiqueta: 'Ninguna (slot libre)' }] : [];
  }

  private cargarAccesorios() {
    this.accesoriosInstalarTodos = [];
    this.accesoriosInstalar = [];
    this.accesoriosRetirar = [];
    if (!this.laptop || !this.tipoPieza) { return; }
    const tipo = this.tipoPieza;
    const almacen = this.laptop.iD_Almacen;

    // Pieza instalada: solo con existencia en el almacén de la laptop
    this.laptopsService.consultarAccesorios(almacen, tipo, true).subscribe({
      next: (lista) => { this.accesoriosInstalarTodos = this.conEtiqueta(lista); this.refiltrarInstalables(); },
      error: (err) => this.toastr.error(this.mensajeError(err, 'Error al cargar los accesorios.'))
    });
    // Para conocer el costo de la pieza que sale: todos los componentes del catálogo del tipo
    this.laptopsService.consultarAccesorios(almacen, tipo, false).subscribe({
      next: (lista) => this.accesoriosRetirar = this.conEtiqueta(lista),
      error: (err) => this.toastr.error(this.mensajeError(err, 'Error al cargar los accesorios.'))
    });
  }

  /** RAM: solo del mismo DDR que ya tiene la laptop (no se ofrece DDR3 a una laptop DDR4). */
  private refiltrarInstalables() {
    const tipoRam = this.tipoPieza === 'RAM' ? this.tipoRamLaptop : null;
    this.accesoriosInstalar = !tipoRam
      ? this.accesoriosInstalarTodos
      : this.accesoriosInstalarTodos.filter(a => {
          const tipo = this.modelosComponente.find(m => m.descripcion === a.modelo)?.tipo;
          return !tipo || tipo === tipoRam;
        });
  }

  private conEtiqueta(lista: LaptopAccesorio[]): LaptopAccesorio[] {
    return (lista || []).map(a => ({
      ...a,
      etiqueta: `${a.modelo} · ${a.descripcion_Accesorio} (stock ${a.cantidad})`
    }));
  }

  onModuloRetiradoChange() {
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
    const f = this.formCambio.getRawValue();
    // La capacidad y el tipo de la pieza nueva los calcula el SP; el módulo que sale identifica la pieza retirada
    const cambio: LaptopCambioPiezaRequest = {
      imei: this.laptop.imei,
      tipo_Pieza: f.tipoPieza,
      iD_Accesorio_Instalado: Number(f.accesorioInstalado),
      iD_Modulo_Retirado: this.moduloRetirado ? this.moduloRetirado.iD_Modulo : null,
      destino_Retirada: this.moduloRetirado ? f.destinoRetirada : null,
      tecnico: f.tecnico,
      iD_Almacen: this.laptop.iD_Almacen,
      nuevo_Precio_Detalle: this.requierePrecios ? this.precioDetalleNuevo : null,
      nuevo_Precio_Por_Mayor: this.requierePrecios ? this.precioMayorNuevo : null,
      usuario: this.loginService.getUserName()
    };

    this.isLoading = true;
    const tecnicoNombre = this.nombreTecnico(cambio.tecnico);
    this.laptopsService.registrarCambioPieza(cambio).subscribe({
      next: (resultado) => {
        this.isLoading = false;
        this.toastr.success('Cambio de pieza registrado satisfactoriamente.');
        // Si la pieza retirada queda en custodia, se ofrece imprimir el comprobante
        const registrado = resultado && resultado.length ? resultado[0] : null;
        this.comprobante = registrado && registrado.estado_Custodia === 'PENDIENTE'
          ? { idCambio: Number(registrado.iD_Cambio), tecnicoNombre }
          : null;
        // Se refrescan los datos de la laptop (costo y configuración nuevos), sus módulos, el historial y las existencias
        this.laptopsService.consultarEquipo(cambio.imei).subscribe(eq => {
          if (eq && eq.length) { this.laptop = eq[0]; }
        });
        this.resetFormCambio();
        this.cargarModulos();
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
      { campo: 'moduloRetirado', texto: 'Pieza que se retira (o Ninguna)' },
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
    if (this.instalada && this.capacidadInstalada === null) {
      faltantes.push('Capacidad de la pieza (revise la descripción del accesorio)');
    }
    if (!this.preciosValidos) {
      faltantes.push(`Precios de venta (${this.mensajePrecios.replace(/\.$/, '')})`);
    }
    return faltantes;
  }

  private resetFormCambio() {
    this.formCambio.reset({
      tipoPieza: null, accesorioInstalado: null, moduloRetirado: null,
      destinoRetirada: null, tecnico: null, precioDetalle: null, precioMayor: null
    });
    this.formCambio.get('destinoRetirada')?.clearValidators();
    this.formCambio.get('destinoRetirada')?.updateValueAndValidity();
    this.accesoriosInstalarTodos = [];
    this.accesoriosInstalar = [];
    this.accesoriosRetirar = [];
    this.opcionesRetirada = [];
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
      case 'ANULADO': return 'bg-danger';
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
