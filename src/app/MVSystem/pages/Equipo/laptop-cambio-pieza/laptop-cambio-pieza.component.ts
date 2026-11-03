import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, merge } from 'rxjs';
import { LoginService } from 'src/app/auth/login.service';
import {
  DestinoRetirada, LaptopAccesorio, LaptopCambioHistorial, LaptopCambioPiezaRequest, LaptopCustodiaConfig, LaptopCustodiaPendiente, LaptopEquipo, LaptopModulo, ModeloComponente, TipoPieza
} from 'src/app/core/interfaces/laptop.interface';
import { LaptopsService } from 'src/app/core/services/laptops.service';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';

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
  formBusqueda: FormGroup = this.fb.group({
    imei: ['', [Validators.required, Validators.maxLength(30)]]
  });

  formCambio: FormGroup = this.fb.group({
    // Módulo de la laptop que sale (id) o 0 = "Ninguna (slot libre)"; null = aún sin elegir
    moduloRetirado: [null, Validators.required],
    accesorioInstalado: [null, Validators.required],
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
  actualizandoLista = false;
  opcionesRetirada: OpcionRetirada[] = [];
  historial: LaptopCambioHistorial[] = [];
  configCustodia: LaptopCustodiaConfig | null = null;
  vencidosTecnico: LaptopCustodiaPendiente[] = [];
  cambioAnular: LaptopCambioHistorial | null = null;

  isLoading = false;
  isBuscando = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private laptopsService: LaptopsService,
    private loginService: LoginService,
    private validatorPermissionService: ValidatorPermissionService
  ) { }

  ngOnInit(): void {
    this.laptopsService.consultarModelosComponente().subscribe({
      next: (modelos) => { this.modelosComponente = modelos || []; this.refiltrarInstalables(); },
      error: (err) => this.toastr.error(this.mensajeError(err, 'Error al cargar los modelos de componentes.'))
    });

    // Los precios sugeridos se recalculan siempre que cambie algo que afecte el costo nuevo
    merge(
      this.formCambio.get('accesorioInstalado')!.valueChanges,
      this.formCambio.get('moduloRetirado')!.valueChanges
    ).subscribe(() => this.sugerirPrecios());

    // Tarea 16: aviso (y bloqueo si está activo) cuando el técnico tiene piezas en custodia vencidas
    this.laptopsService.consultarConfiguracionCustodia().subscribe({
      next: (cfg) => { this.configCustodia = cfg; this.aplicarBloqueo(); },
      error: () => { /* sin configuración solo se pierde el aviso; el SP valida igual */ }
    });
    this.consultarVencidosTecnico();
  }

  /** El técnico es siempre el usuario que registra el cambio (el API lo toma del token). */
  private consultarVencidosTecnico() {
    this.vencidosTecnico = [];
    this.laptopsService.consultarPendientes(this.loginService.getUserName(), null).subscribe({
      next: (lista) => { this.vencidosTecnico = (lista || []).filter(p => p.vencido); this.aplicarBloqueo(); },
      error: () => { this.vencidosTecnico = []; this.aplicarBloqueo(); }
    });
  }

  /** Con piezas vencidas sin recibir (y el bloqueo activo) no se puede llenar el cambio: se evita perder tiempo. */
  private aplicarBloqueo() {
    if (this.tecnicoBloqueado) {
      this.formCambio.disable({ emitEvent: false });
    } else if (this.formCambio.disabled) {
      this.formCambio.enable({ emitEvent: false });
    }
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
    this.cargarAccesorios();
    this.cargarHistorial();
  }

  get tecnicoBloqueado(): boolean {
    return !!this.configCustodia?.bloquearVencidos && this.vencidosTecnico.length > 0;
  }

  // ---------------------------------------------------------------
  // Getters de apoyo
  // ---------------------------------------------------------------
  /** El tipo de pieza (RAM / almacenamiento) se deduce de la pieza que entra. */
  get tipoPieza(): TipoPieza | null {
    return this.instalada ? this.tipoPiezaDe(this.instalada) : null;
  }

  /** Ya se eligió qué sale (un módulo o "Ninguna"). */
  get retiradaElegida(): boolean {
    const v = this.formCambio.get('moduloRetirado')?.value;
    return v !== null && v !== undefined;
  }

  get instalada(): LaptopAccesorio | undefined {
    const id = this.formCambio.get('accesorioInstalado')?.value;
    return this.accesoriosInstalar.find(a => a.iD_Accesorio === id);
  }

  /** RAM o almacenamiento de un accesorio, según su modelo (igual que el SP: modelos RAM*, SSD*, HDD*). */
  private tipoPiezaDe(a: LaptopAccesorio): TipoPieza | null {
    const delCatalogo = this.modelosComponente.find(m => m.descripcion === a.modelo)?.tipo_Pieza;
    if (delCatalogo) { return delCatalogo; }
    if (/^RAM/i.test(a.modelo || '')) { return 'RAM'; }
    return /^(SSD|HDD)/i.test(a.modelo || '') ? 'ALMACENAMIENTO' : null;
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

  /** Toda pieza retirada queda en custodia del técnico; la entrega al cliente la registra el encargado desde Custodia. */
  get destino(): DestinoRetirada | null {
    return this.hayRetirada ? 'CUSTODIA' : null;
  }

  /**
   * Costo de la pieza que sale (igual que el SP): el costo de catalogo del mismo accesorio
   * (el del modulo o, si el modulo no tiene accesorio, el del mismo modelo y capacidad).
   * null = no hay forma de saberlo (la pieza no esta en el catalogo): el SP la crea con costo 0.
   */
  get costoRetirada(): number | null {
    const m = this.moduloRetirado;
    if (!m) { return null; }
    const lista = this.accesoriosRetirar.filter(a => !/\(usado\)\s*$/i.test(a.descripcion_Accesorio || ''));
    const delModulo = lista.find(a => a.iD_Accesorio === m.iD_Accesorio);
    const accesorio = delModulo || lista.find(a =>
      a.modelo === m.modelo_Componente && this.capacidadDeDescripcion(a.descripcion_Accesorio) === m.capacidad_GB);
    return accesorio ? Number(accesorio.costo_Equipo) : null;
  }

  /** R4 / R10: si la pieza se queda en custodia se resta su costo de catálogo; si se la lleva el cliente no. */
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
    if (!this.laptop || !this.formCambio.valid || !this.tipoPieza) { return false; }
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
        if (equipo.preFactura_Pendiente) {
          this.limpiarLaptop();
          this.toastr.error(`La laptop está en la prefactura pendiente #${equipo.preFactura_Pendiente}. Anule la prefactura antes de cambiar piezas.`);
          return;
        }
        this.laptop = equipo;
        this.resetFormCambio();
        this.cargarModulos();
        this.cargarAccesorios();
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
  /**
   * Al elegir la pieza que entra se arma la lista de lo que puede salir (los módulos de la laptop del mismo tipo + "Ninguna")
   * y se preselecciona: el único módulo, o uno cuando todos son iguales (ej. 8+8). Con módulos distintos, el usuario elige.
   */
  onInstaladaChange() {
    const retirada = this.formCambio.get('moduloRetirado');
    retirada?.setValue(null);
    this.armarOpcionesRetirada();
    if (!this.tipoPieza) { return; }
    const modulos = this.modulosDelTipo;
    const iguales = modulos.length > 0
      && modulos.every(m => m.capacidad_GB === modulos[0].capacidad_GB && m.iD_Modelo_Componente === modulos[0].iD_Modelo_Componente);
    if (iguales) {
      retirada?.setValue(modulos[0].iD_Modulo);
    } else if (!modulos.length) {
      retirada?.setValue(0);
    }
  }

  /** "Pieza que sale": los módulos de la laptop del mismo tipo que la pieza que entra + "Ninguna (agregar en slot libre)". */
  private armarOpcionesRetirada() {
    const tipo = this.tipoPieza;
    if (!this.laptop || !tipo) {
      this.opcionesRetirada = [];
      return;
    }
    const delTipo = this.modulos.filter(m => m.tipo_Pieza === tipo);
    const nombre = tipo === 'RAM' ? 'Memoria' : 'Disco';
    const modulos = delTipo.map((m, i) => ({
      id: m.iD_Modulo,
      etiqueta: `${nombre}${delTipo.length > 1 ? ' ' + (i + 1) : ''} · ${this.textoCapacidad(m.capacidad_GB)} · ${m.modelo_Componente} (${m.tipo})`
    }));
    this.opcionesRetirada = [...modulos, { id: 0, etiqueta: 'Ninguna (agregar en slot libre)' }];
  }

  /**
   * Piezas de componentes del almacén de la laptop, de memorias y de discos:
   * con existencia (las que se pueden instalar) y todas (para conocer el costo de la que sale).
   */
  private cargarAccesorios(alTerminar?: () => void) {
    if (!this.laptop) { return; }
    const almacen = this.laptop.iD_Almacen;
    const tipos: TipoPieza[] = ['RAM', 'ALMACENAMIENTO'];
    const unir = (listas: LaptopAccesorio[][]) => this.conEtiqueta(listas.reduce((t, l) => t.concat(l || []), [] as LaptopAccesorio[]));

    forkJoin([
      forkJoin(tipos.map(t => this.laptopsService.consultarAccesorios(almacen, t, true))),
      forkJoin(tipos.map(t => this.laptopsService.consultarAccesorios(almacen, t, false)))
    ]).subscribe({
      next: ([conStock, catalogo]) => {
        this.accesoriosInstalarTodos = unir(conStock);
        this.accesoriosRetirar = unir(catalogo);
        this.refiltrarInstalables();
        if (alTerminar) { alTerminar(); }
      },
      error: (err) => {
        this.toastr.error(this.mensajeError(err, 'Error al cargar los accesorios.'));
        if (alTerminar) { alTerminar(); }
      }
    });
  }

  /**
   * Vuelve a cargar las listas de piezas sin tocar el formulario (ej. el encargado acaba de registrar la pieza en Accesorios).
   * Si la pieza elegida ya no esta disponible, se limpia solo ese campo.
   */
  actualizarLista() {
    if (!this.laptop || this.actualizandoLista) { return; }
    this.actualizandoLista = true;
    this.cargarAccesorios(() => {
      this.actualizandoLista = false;
      const elegido = this.formCambio.get('accesorioInstalado')?.value;
      if (elegido && !this.accesoriosInstalar.some(a => a.iD_Accesorio === elegido)) {
        this.formCambio.get('accesorioInstalado')?.setValue(null);
        this.onInstaladaChange();
        this.toastr.warning('La pieza elegida ya no tiene existencia en este almacén; seleccione otra.');
      }
    });
  }

  /** Pieza que entra: memorias (solo del mismo DDR que ya tiene la laptop) y discos. */
  private refiltrarInstalables() {
    const tipoRam = this.tipoRamLaptop;
    this.accesoriosInstalar = this.accesoriosInstalarTodos.filter(a => {
      if (this.tipoPiezaDe(a) !== 'RAM' || !tipoRam) { return true; }
      const ddr = this.modelosComponente.find(m => m.descripcion === a.modelo)?.tipo;
      return !ddr || ddr === tipoRam;
    });
  }

  private conEtiqueta(lista: LaptopAccesorio[]): LaptopAccesorio[] {
    return (lista || []).map(a => ({
      ...a,
      etiqueta: `${a.modelo} · ${a.descripcion_Accesorio} (stock ${a.cantidad})`,
      grupo: this.tipoPiezaDe(a) === 'RAM' ? 'Memorias' : 'Discos'
    }));
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
      tipo_Pieza: this.tipoPieza as TipoPieza,
      iD_Accesorio_Instalado: Number(f.accesorioInstalado),
      iD_Modulo_Retirado: this.moduloRetirado ? this.moduloRetirado.iD_Modulo : null,
      destino_Retirada: this.moduloRetirado ? 'CUSTODIA' : null,
      tecnico: this.loginService.getUserName(),
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
        // Se refrescan los datos de la laptop (costo y configuración nuevos), sus módulos, el historial y las existencias
        this.laptopsService.consultarEquipo(cambio.imei).subscribe(eq => {
          if (eq && eq.length) { this.laptop = eq[0]; }
        });
        this.resetFormCambio();
        this.cargarModulos();
        this.cargarAccesorios();
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
      { campo: 'accesorioInstalado', texto: 'Pieza que entra' },
      { campo: 'moduloRetirado', texto: 'Pieza que sale (o Ninguna)' }
    ];
    const faltantes = etiquetas
      .filter(e => {
        const c = this.formCambio.get(e.campo);
        return !!c && c.enabled && c.invalid;
      })
      .map(e => e.texto);
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
      accesorioInstalado: null, moduloRetirado: null,
      precioDetalle: null, precioMayor: null
    });
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
