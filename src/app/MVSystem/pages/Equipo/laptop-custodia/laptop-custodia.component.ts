import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/auth/login.service';
import { LaptopCustodiaAccion, LaptopCustodiaPendiente } from 'src/app/core/interfaces/laptop.interface';
import { LaptopsService } from 'src/app/core/services/laptops.service';
import { ImprimirPdfBlob } from 'src/app/helpers/helper';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';
import { SeguridadService } from '../../seguridad/servicios/seguridad.service';

interface GrupoTecnico {
  tecnico: string;
  items: LaptopCustodiaPendiente[];
  vencidos: number;
}

type AccionCustodia = 'RECIBIR' | 'ENTREGAR_CLIENTE';

@Component({
  selector: 'app-laptop-custodia',
  templateUrl: './laptop-custodia.component.html',
  styleUrls: ['./laptop-custodia.component.css']
})
export class LaptopCustodiaComponent implements OnInit {
  // Se lee de appsettings (Laptops:HorasMaxCustodia) a través del API
  horasMax = 24;

  tecnicos: { login: string; etiqueta: string }[] = [];
  tecnicoFiltro: string | null = null;

  pendientes: LaptopCustodiaPendiente[] = [];
  grupos: GrupoTecnico[] = [];

  isCargando = false;
  isProcesando = false;

  // Confirmación de la acción sobre un pendiente
  seleccionado: LaptopCustodiaPendiente | null = null;
  accion: AccionCustodia | null = null;
  nota = '';
  pedirPrecios = false;
  precioDetalle: number | null = null;
  precioMayor: number | null = null;
  mensajePrecio = '';
  // Al recibir: costo y precios del accesorio cuando aun no los tiene (la pieza se creo al retirarla)
  pedirPreciosAccesorio = false;
  accCosto: number | null = null;
  accMayor: number | null = null;
  accDetalle: number | null = null;

  constructor(
    private toastr: ToastrService,
    private laptopsService: LaptopsService,
    private seguridadService: SeguridadService,
    private loginService: LoginService,
    private validatorPermissionService: ValidatorPermissionService
  ) { }

  /** Solo quien tiene LAPTOP_CUSTODIA_RECIBIR ve los botones Recibir / Entregada al cliente. */
  get puedeRecibir(): boolean {
    return this.validatorPermissionService.validateUserRole('LAPTOP_CUSTODIA_RECIBIR');
  }

  ngOnInit(): void {
    this.cargarTecnicos();
    this.laptopsService.consultarConfiguracionCustodia().subscribe({
      next: (cfg) => { this.horasMax = cfg.horasMax; this.buscar(); },
      error: () => this.buscar()
    });
  }

  get totalVencidos(): number {
    return this.pendientes.filter(p => p.vencido).length;
  }

  buscar() {
    this.isCargando = true;
    this.laptopsService.consultarPendientes(this.tecnicoFiltro, null).subscribe({
      next: (lista) => {
        this.pendientes = lista || [];
        this.agrupar();
        this.isCargando = false;
      },
      error: (err) => {
        this.isCargando = false;
        this.toastr.error(this.mensajeError(err, 'Error al consultar las piezas pendientes.'));
      }
    });
  }

  private agrupar() {
    const mapa = new Map<string, LaptopCustodiaPendiente[]>();
    this.pendientes.forEach(p => {
      const items = mapa.get(p.tecnico) || [];
      items.push(p);
      mapa.set(p.tecnico, items);
    });
    this.grupos = Array.from(mapa.entries()).map(([tecnico, items]) => ({
      tecnico,
      items,
      vencidos: items.filter(i => i.vencido).length
    }));
  }

  /** Antigüedad legible: "5.5 h" o "2 d 3 h". */
  antiguedad(horas: number): string {
    const h = Number(horas);
    if (h < 24) { return `${h.toFixed(1)} h`; }
    const dias = Math.floor(h / 24);
    return `${dias} d ${Math.floor(h - dias * 24)} h`;
  }

  // ---------------------------------------------------------------
  // Acciones
  // ---------------------------------------------------------------
  abrirAccion(p: LaptopCustodiaPendiente, accion: AccionCustodia) {
    this.seleccionado = p;
    this.accion = accion;
    this.nota = '';
    this.pedirPrecios = false;
    this.precioDetalle = null;
    this.precioMayor = null;
    this.mensajePrecio = '';
    this.pedirPreciosAccesorio = accion === 'RECIBIR' && !!p.requiere_Precios;
    // El costo de la pieza usada ya viene calculado por el sistema; el usuario lo confirma o lo ajusta
    this.accCosto = p.costo_Retirado > 0 ? Number(p.costo_Retirado) : null;
    this.accMayor = null;
    this.accDetalle = null;
  }

  /** Reimprime el comprobante de custodia de una pieza pendiente. */
  imprimirComprobante(p: LaptopCustodiaPendiente) {
    const etiqueta = this.tecnicos.find(t => t.login === p.tecnico)?.etiqueta || p.tecnico;
    const nombre = etiqueta.replace(/\s*\([^)]*\)\s*$/, '');
    this.laptopsService.obtenerComprobanteCustodia(
      p.iD_Cambio,
      this.loginService.getUserIdEmpresa,
      this.loginService.getUserIdSucursal,
      nombre
    ).subscribe({
      next: (blob) => {
        if (!blob || blob.size === 0) {
          this.toastr.warning('El comprobante está vacío.');
          return;
        }
        ImprimirPdfBlob(blob);
      },
      error: () => this.toastr.warning('No se pudo generar el comprobante de custodia.')
    });
  }

  cancelarAccion() {
    this.seleccionado = null;
    this.accion = null;
  }

  get preciosCompletos(): boolean {
    return (!this.pedirPrecios || (!!this.precioDetalle && !!this.precioMayor && this.precioMayor <= this.precioDetalle))
      && this.preciosAccesorioValidos;
  }

  /** Costo <= precio por mayor <= precio al detalle, todos mayores a 0. */
  get preciosAccesorioValidos(): boolean {
    if (!this.pedirPreciosAccesorio) { return true; }
    return !!this.accCosto && !!this.accMayor && !!this.accDetalle
      && this.accCosto > 0 && this.accCosto <= this.accMayor && this.accMayor <= this.accDetalle;
  }

  get mensajePreciosAccesorio(): string {
    if (!this.accCosto || !this.accMayor || !this.accDetalle) { return 'Indique el costo, el precio por mayor y el precio al detalle.'; }
    if (this.accCosto > this.accMayor) { return 'El costo no puede ser mayor que el precio por mayor.'; }
    if (this.accMayor > this.accDetalle) { return 'El precio por mayor no puede ser mayor que el precio al detalle.'; }
    return '';
  }

  confirmarAccion() {
    if (!this.seleccionado || !this.accion || !this.preciosCompletos) { return; }

    const datos: LaptopCustodiaAccion = {
      iD_Cambio: this.seleccionado.iD_Cambio,
      usuario: this.loginService.getUserName(),
      nota: this.nota.trim() || null
    };
    if (this.accion === 'ENTREGAR_CLIENTE' && this.pedirPrecios) {
      datos.nuevo_Precio_Detalle = this.precioDetalle;
      datos.nuevo_Precio_Por_Mayor = this.precioMayor;
    }
    if (this.accion === 'RECIBIR' && this.pedirPreciosAccesorio) {
      datos.accesorio_Costo = this.accCosto;
      datos.accesorio_Precio_Por_Mayor = this.accMayor;
      datos.accesorio_Precio_Detalle = this.accDetalle;
    }

    const llamada = this.accion === 'RECIBIR'
      ? this.laptopsService.recibirPieza(datos)
      : this.laptopsService.entregarPiezaCliente(datos);
    const textoOk = this.accion === 'RECIBIR'
      ? 'Pieza recibida satisfactoriamente.'
      : 'Pieza entregada al cliente satisfactoriamente.';

    this.isProcesando = true;
    llamada.subscribe({
      next: () => {
        this.isProcesando = false;
        this.toastr.success(textoOk);
        this.cancelarAccion();
        this.buscar();
      },
      error: (err) => {
        this.isProcesando = false;
        const msg = this.mensajeError(err, 'No se pudo procesar la pieza.');
        // El costo vuelve a superar el precio de venta: se piden precios nuevos y se reintenta
        if (this.accion === 'ENTREGAR_CLIENTE' && /Indique un precio|precio por mayor no puede/i.test(msg)) {
          this.pedirPrecios = true;
          this.mensajePrecio = msg;
          return;
        }
        this.toastr.error(msg, '', { closeButton: true, progressBar: true });
      }
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

  private mensajeError(err: any, porDefecto: string): string {
    // El interceptor de errores devuelve el mensaje del API como texto en los 400
    if (typeof err === 'string' && err) { return err; }
    const e = err?.error;
    if (typeof e === 'string' && e) { return e; }
    if (e?.message) { return e.message; }
    return porDefecto;
  }
}
