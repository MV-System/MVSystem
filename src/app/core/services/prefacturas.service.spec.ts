import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PreFacturasService, PreFactura, PreDetalleFactura } from './prefacturas.service';
import { APIURL } from 'src/app/config/url';

describe('PreFacturasService', () => {
  let service: PreFacturasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PreFacturasService]
    });
    service = TestBed.inject(PreFacturasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear una pre-factura', () => {
    const mockPreFactura: PreFactura = {
      numero_PreFactura: 0,
      iD_Cliente: 1,
      iD_Tipo_Factura: 1,
      iD_Sucursal: 1,
      subTotal: 100,
      total: 100,
      cantidad_Articulos: 1,
      nombres: '',
      apellidos: '',
      numero_Telefono: '',
      tipo_Factura: '',
      iD_Vendedor: 0,
      vendedor_Nombres: '',
      iD_Tipo_Pagos: 0,
      tipo_Pago: '',
      sucursal: '',
      descuento: 0,
      itbis: 0,
      abono: null,
      tiempo_Credito: null,
      nota: '',
      estado: '',
      usuario: '',
      fecha_Registro: '',
      fecha_Procesamiento: null,
      usuario_Procesamiento: null,
      nfcTipoNumero: '',
      nfcfiscal: '',
      ncF_NUMERO: '',
      rnc: '',
      literal: null,
      cotizacion_Numero: 0,
      detalleFacturaList: null
    };
    service.crearPreFactura(mockPreFactura).subscribe(resp => {
      expect(resp).toBeTruthy();
    });
    const req = httpMock.expectOne(APIURL.PreFacturas.Crear);
    expect(req.request.method).toBe('POST');
    req.flush({ ok: true });
  });

  it('debe agregar detalle a pre-factura', () => {
    const mockDetalle: PreDetalleFactura = {
      Numero_PreFactura: 1,
      ID_Equipo: 'IMEI123',
      ID_Tipo: 1,
      ID_Garantia: 1,
      SubTotal: 100,
      Total: 100
    };
    service.agregarDetallePreFactura(mockDetalle).subscribe(resp => {
      expect(resp).toBeTruthy();
    });
    const req = httpMock.expectOne(APIURL.PreFacturas.AgregarDetalle);
    expect(req.request.method).toBe('POST');
    req.flush({ ok: true });
  });

  it('debe listar pre-facturas', () => {
    service.listarPreFacturas({ Estado: 'P' }).subscribe(resp => {
      expect(resp).toBeTruthy();
    });
    const req = httpMock.expectOne(r => r.url === APIURL.PreFacturas.Listar && r.method === 'GET');
  req.flush([{ numero_PreFactura: 1 }]);
  });

  it('debe obtener detalle de una pre-factura', () => {
    service.obtenerDetallePreFactura(1).subscribe(resp => {
      expect(resp).toBeTruthy();
    });
    const req = httpMock.expectOne(`${APIURL.PreFacturas.Detalle}/1/detalle`);
    expect(req.request.method).toBe('GET');
  req.flush([{ numero_PreFactura: 1 }]);
  });

  it('debe procesar una pre-factura', () => {
    service.procesarPreFactura(1, 'testUser').subscribe(resp => {
      expect(resp).toBeTruthy();
    });
    const req = httpMock.expectOne(`${APIURL.PreFacturas.Procesar}/1/procesar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ UsuarioProcesamiento: 'testUser' });
    req.flush({ ok: true });
  });

  it('debe anular una pre-factura', () => {
    service.anularPreFactura(1).subscribe(resp => {
      expect(resp).toBeTruthy();
    });
    const req = httpMock.expectOne(`${APIURL.PreFacturas.Anular}/1/anular`);
    expect(req.request.method).toBe('POST');
    req.flush({ ok: true });
  });
});
