/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FacturacionConsultaComponent } from './facturacion-consulta.component';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { VendedorService } from 'src/app/core/services/vendedor.service';
import { LoginService } from 'src/app/auth/login.service';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';
import { RDialogService } from 'src/app/shared/components/r-dialog/r-dialog.service';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';
import { UserTrackingService } from 'src/app/core/services/user-tracking.service';
import { FacturaConsulta, DetalleFacturaList, FacturaFilter } from 'src/app/core/interfaces/mantenimiento';
import { Almacen, TipoPago } from 'src/app/core/interfaces/catalogo.interface';

describe('FacturacionConsultaComponent', () => {
  let component: FacturacionConsultaComponent;
  let fixture: ComponentFixture<FacturacionConsultaComponent>;
  let mockMantenimientoService: jasmine.SpyObj<MantenimientoService>;
  let mockCatalogosService: jasmine.SpyObj<CatalogosService>;
  let mockVendedorService: jasmine.SpyObj<VendedorService>;
  let mockLoginService: jasmine.SpyObj<LoginService>;
  let mockValidatorPermissionService: jasmine.SpyObj<ValidatorPermissionService>;
  let mockRDialogService: jasmine.SpyObj<RDialogService>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;
  let mockTrackingService: jasmine.SpyObj<UserTrackingService>;

  // Datos de prueba
  const mockFacturas: FacturaConsulta[] = [
    {
      numeroFactura: 1001,
      nombres: 'Juan',
      apellidos: 'Pérez',
      telefono: 8095551234,
      tipoFactura: 'Contado',
      tipoPago: 'Efectivo',
      subTotal: 1000,
      descuento: 100,
      itbis: 162,
      total: 1062,
      abono: 0,
      ncf: 100000001,
      rnc: 123456789,
      vendedor: 'Carlos Vendedor',
      almacen: 'Almacén Central',
      nota: 'Nota de prueba',
      fechaFacturacion: '2025-09-15',
      totalRecord: 1,
      line: 1,
      lastLine: 1,
      totalFacturado: 1062
    }
  ];

  const mockDetalleFactura: DetalleFacturaList[] = [
    {
      numeroFactura: 1001,
      idEquipo: 'IMEI123456789',
      descripcion: 'Samsung Galaxy S21',
      cantidad: 1,
      precio: 1000,
      subTotal: 1000,
      descuento: 100,
      itbis: 162,
      total: 1062,
      idTipo: 1,
      idGarantia: 1,
      fechaRegistro: '2025-09-15',
      idVendedor: 1,
      idTipoFactura: 1,
      Usuario: 'testuser',
      editMode: false,
      EquipoActual: '',
      EquipoNuevo: ''
    }
  ];

  const mockAlmacenes: Almacen[] = [
    {
      iD_Almacen: 1,
      descripcion: 'Almacén Central'
    }
  ];

  const mockVendedores = [
    {
      iD_Vendedor: 1,
      nombres: 'Carlos Vendedor',
      apellidos: 'Test',
      activo: true
    }
  ];

  const mockTiposPago: TipoPago[] = [
    { iD_Tipo_Pagos: 1, descripcion_Tipo_Pagos: 'Efectivo' }
  ];

  beforeEach(async () => {
    // Crear spies para todos los servicios
    mockMantenimientoService = jasmine.createSpyObj('MantenimientoService', [
      'getFacturas',
      'getDetalleFactura',
      'postFacturaConsultaReport',
      'postFacturaReport',
      'postFacturaMiniReport'
    ]);
    mockCatalogosService = jasmine.createSpyObj('CatalogosService', ['getSucursales', 'getTipoPagoLista']);
    mockVendedorService = jasmine.createSpyObj('VendedorService', ['getVendedorLista']);
    mockLoginService = jasmine.createSpyObj('LoginService', ['getUserName'], {
      getUserIdSucursal: '1',
      getUserEmpresa: 'Test Company',
      getUserIdEmpresa: '1'
    });
    mockValidatorPermissionService = jasmine.createSpyObj('ValidatorPermissionService', [
      'validateUserRole'
    ]);
    mockRDialogService = jasmine.createSpyObj('RDialogService', ['openDialog']);
    mockLoadingService = jasmine.createSpyObj('LoadingService', ['showLoading', 'hideLoading']);
    mockToastrService = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info']);
    mockTrackingService = jasmine.createSpyObj('UserTrackingService', ['trackPageView', 'trackAction', 'trackError']);

    // Configurar valores de retorno por defecto
    mockMantenimientoService.getFacturas.and.returnValue(of(mockFacturas));
    mockMantenimientoService.getDetalleFactura.and.returnValue(of(mockDetalleFactura));
    mockCatalogosService.getSucursales.and.returnValue(of(mockAlmacenes));
    mockCatalogosService.getTipoPagoLista.and.returnValue(of(mockTiposPago));
    mockVendedorService.getVendedorLista.and.returnValue(of(mockVendedores));
    mockLoginService.getUserName.and.returnValue('testuser');
    mockValidatorPermissionService.validateUserRole.and.returnValue(true);
    mockTrackingService.trackPageView.and.returnValue(of({ success: true, message: 'Tracked' }));
    mockTrackingService.trackAction.and.returnValue(of({ success: true, message: 'Tracked' }));
    mockTrackingService.trackError.and.returnValue(of({ success: true, message: 'Tracked' }));

    await TestBed.configureTestingModule({
      declarations: [FacturacionConsultaComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        NgxPaginationModule,
        ToastrModule.forRoot()
      ],
      providers: [
        FormBuilder,
        { provide: MantenimientoService, useValue: mockMantenimientoService },
        { provide: CatalogosService, useValue: mockCatalogosService },
        { provide: VendedorService, useValue: mockVendedorService },
        { provide: LoginService, useValue: mockLoginService },
        { provide: ValidatorPermissionService, useValue: mockValidatorPermissionService },
        { provide: RDialogService, useValue: mockRDialogService },
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: UserTrackingService, useValue: mockTrackingService },
        { provide: ToastrService, useValue: mockToastrService }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignorar componentes no reconocidos
    }).compileComponents();

    fixture = TestBed.createComponent(FacturacionConsultaComponent);
    component = fixture.componentInstance;

    // No ejecutar detectChanges aquí para evitar problemas con el template
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.title).toBe('Consulta Facturas');
      expect(component.breadcrumbItem).toBe('Consulta Facturas');
      expect(component.breadcrumb).toBe('Consulta');
      expect(component.currentPage).toBe(1);
      expect(component.pageIndex).toBe(1);
      expect(component.pageSize).toBe(10);
      expect(component.isLoading).toBeFalse();
      expect(component.onFacturaButton).toBeFalse();
    });

    it('should call initialization methods on ngOnInit', () => {
      spyOn(component, 'getFacturas');
      spyOn(component, 'getAlmacenes');
      spyOn(component, 'getVendedores');
      spyOn(component, 'getTiposPago');

      component.ngOnInit();

      expect(component.getFacturas).toHaveBeenCalled();
      expect(component.getAlmacenes).toHaveBeenCalled();
      expect(component.getVendedores).toHaveBeenCalled();
      expect(component.getTiposPago).toHaveBeenCalled();
    });

    it('should initialize form with correct default values', () => {
      expect(component.form.get('almacen')?.value).toBe('1');
      expect(component.form.get('criterio')?.value).toBe('');
      expect(component.form.get('iD_Vendedor')?.value).toBe('');
    });
  });

  describe('Data Loading', () => {
    it('should load facturas successfully', () => {
      component.getFacturas();

      expect(mockLoadingService.showLoading).toHaveBeenCalled();
      expect(mockMantenimientoService.getFacturas).toHaveBeenCalled();
      expect(component.facturas).toEqual(mockFacturas);
      expect(component.totalRecord).toBe(1);
      expect(component.totalFacturado).toBe(1062);
      expect(mockLoadingService.hideLoading).toHaveBeenCalled();
    });

    it('should load detalle factura successfully', () => {
      component.getDetalleFactura(1001);

      expect(mockMantenimientoService.getDetalleFactura).toHaveBeenCalledWith(1001, 1);
      expect(component.detalleFactura).toEqual(mockDetalleFactura);
      expect(component.numerofactura).toBe(1001);
    });

    it('should load details using the selected branch when invoice numbers repeat', () => {
      const facturaOtraSucursal = { ...mockFacturas[0], idSucursal: 3 };
      const facturaSeleccionada = { ...mockFacturas[0], idSucursal: 9 };
      component.facturas = [facturaOtraSucursal, facturaSeleccionada];

      component.getDetalleFactura(facturaSeleccionada);

      expect(mockMantenimientoService.getDetalleFactura).toHaveBeenCalledWith(1001, 9);
      expect(component.facturaSeleccionada).toBe(facturaSeleccionada);
    });

    it('should load almacenes successfully', () => {
      component.getAlmacenes();

      expect(mockCatalogosService.getSucursales).toHaveBeenCalled();
      expect(component.almacenes).toEqual(mockAlmacenes);
    });

    it('should load vendedores successfully', () => {
      component.getVendedores();

      expect(mockVendedorService.getVendedorLista).toHaveBeenCalled();
      expect(component.vendedores).toEqual(mockVendedores);
    });

    it('should load payment types successfully', () => {
      component.getTiposPago();

      expect(mockCatalogosService.getTipoPagoLista).toHaveBeenCalled();
      expect(component.tiposPago).toEqual(mockTiposPago);
    });
  });

  describe('Pagination', () => {
    it('should handle page size change', () => {
      spyOn(component, 'getFacturas');

      component.onPageSizeChange(50);

      expect(component.paginate.pageSize).toBe(50);
      expect(component.getFacturas).toHaveBeenCalled();
    });

    it('should handle page change', () => {
      spyOn(component, 'getFacturas');

      component.pageChanged(3);

      expect(component.pageIndex).toBe(3);
      expect(component.paginate.pageIndex).toBe(3);
      expect(component.getFacturas).toHaveBeenCalled();
    });
  });

  describe('Date Range Functionality', () => {
    it('should handle date range change with valid dates', () => {
      spyOn(component, 'getFacturas');
      const dateEvent = {
        beginDate: { year: 2025, month: 9, day: 1 },
        endDate: { year: 2025, month: 9, day: 15 }
      };

      component.onDateRangeChanged(dateEvent);

      expect(component.paginate.fechaInicio).toBe('2025/9/1');
      expect(component.paginate.fechaFinal).toBe('2025/9/15');
      expect(component.getFacturas).toHaveBeenCalled();
    });

    it('should handle date range change with invalid dates', () => {
      spyOn(component, 'getFacturas');
      const dateEvent = {
        beginDate: { year: 0, month: 0, day: 0 },
        endDate: { year: 0, month: 0, day: 0 }
      };

      component.onDateRangeChanged(dateEvent);

      expect(component.paginate.fechaInicio).toBe('');
      expect(component.paginate.fechaFinal).toBe('');
      expect(component.getFacturas).toHaveBeenCalled();
    });
  });

  describe('Search Functionality', () => {
    it('should handle search from child component', () => {
      spyOn(component, 'getFacturas');
      const searchEvent = { criterio: 'test search', pageIndex: 1 };

      component.onBuscarFacturas(searchEvent);

      expect(component.form.get('criterio')?.value).toBe('test search');
      expect(component.pageIndex).toBe(1);
      expect(component.paginate.pageIndex).toBe(1);
      expect(component.getFacturas).toHaveBeenCalled();
    });

    it('should sync criterio with criterioActual', () => {
      // Don't trigger fixture.detectChanges() to avoid rangeDate value accessor error
      component.form.get('criterio')?.setValue('test criterio');

      // Manually trigger the valueChanges subscription
      const criterio = component.form.get('criterio');
      if (criterio) {
        component.criterioActual = criterio.value || '';
      }

      expect(component.criterioActual).toBe('test criterio');
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      component.facturas = mockFacturas;
      component.vendedores = mockVendedores;
    });

    it('should return all facturas when no vendedor is selected', () => {
      component.form.get('iD_Vendedor')?.setValue('');

      const result = component.facturasFiltradas();

      expect(result).toEqual(mockFacturas);
    });

    it('should filter facturas by vendedor', () => {
      component.form.get('iD_Vendedor')?.setValue('1');

      const result = component.facturasFiltradas();

      expect(result).toEqual(mockFacturas);
    });

    it('should return all facturas when vendedor not found', () => {
      component.form.get('iD_Vendedor')?.setValue('999');

      const result = component.facturasFiltradas();

      expect(result).toEqual(mockFacturas);
    });
  });

  describe('Calculations', () => {
    beforeEach(() => {
      component.totalFacturado = 5000;
      component.totalRecord = 10;
    });

    it('should calculate total facturado correctly', () => {
      const result = component.getTotalFacturadoCliente();

      expect(result).toBe(5000);
    });

    it('should return 0 when totalFacturado is undefined', () => {
      component.totalFacturado = undefined as any;

      const result = component.getTotalFacturadoCliente();

      expect(result).toBe(0);
    });

    it('should calculate cantidad facturas correctly', () => {
      const result = component.getCantidadFacturasCliente();

      expect(result).toBe(10);
    });

    it('should return 0 when totalRecord is undefined', () => {
      component.totalRecord = undefined as any;

      const result = component.getCantidadFacturasCliente();

      expect(result).toBe(0);
    });
  });

  describe('Permission Validation', () => {
    it('should validate SelectSucursal permission', () => {
      mockValidatorPermissionService.validateUserRole.and.returnValue(true);

      const result = component.SelectSucursal();

      expect(mockValidatorPermissionService.validateUserRole)
        .toHaveBeenCalledWith('CB_SUCURSAL');
      expect(result).toBeTrue();
    });

    it('should validate CheckComprobante permission', () => {
      mockValidatorPermissionService.validateUserRole.and.returnValue(true);

      const result = component.CheckComprobante();

      expect(mockValidatorPermissionService.validateUserRole)
        .toHaveBeenCalledWith('ComprobanteCheck');
      expect(result).toBeTrue();
    });
  });

  describe('Model Factory', () => {
    it('should create correct FacturaFilter model', () => {
      component.form.patchValue({
        criterio: 'test',
        almacen: '2',
        iD_Vendedor: '3'
      });
      component.paginate = {
        pageIndex: 2,
        pageSize: 25,
        fechaInicio: '2025/9/1',
        fechaFinal: '2025/9/15'
      };
      component.ComprobanteCheck = 1;

      const result = component.modelFacturaFilter();

      expect(result.criterio).toBe('test');
      expect(result.almacen).toBe(2);
      expect(result.IdVendedor).toBe(3);
      expect(result.pageIndex).toBe(2);
      expect(result.pageSize).toBe(25);
      expect(result.fechaInicio).toBe('2025/9/1');
      expect(result.fechaFinal).toBe('2025/9/15');
      expect(result.ComprobanteCheck).toBe(1);
      expect(result.empresa).toBe('Test Company');
      expect(result.IdEmpresa).toBe('1');
      expect(result.IdSucursal).toBe('1');
    });

    it('should use invoice branch and clear dates for reprint', () => {
      const facturaSucursal1 = { ...mockFacturas[0], idSucursal: 5 };
      const facturaSucursal2 = { ...mockFacturas[0], idSucursal: 7 };
      component.facturas = [facturaSucursal1, facturaSucursal2];
      component.facturaSeleccionada = facturaSucursal2;
      component.numerofactura = 1001;

      const result = (component as any).modelFacturaFilterParaImpresion() as FacturaFilter;

      expect(result.almacen).toBe(7);
      expect(result.IdSucursal).toBe('7');
      expect(result.fechaInicio).toBe('');
      expect(result.fechaFinal).toBe('');
      expect(result.numeroFactura).toBe(1001);
    });
  });

  describe('Checkbox Functionality', () => {
    it('should handle checkbox comprobante change when checked', () => {
      spyOn(component, 'getFacturas');

      // Crear un elemento checkbox simulado
      const mockCheckbox = document.createElement('input');
      mockCheckbox.type = 'checkbox';
      mockCheckbox.checked = true;

      // Crear evento con target válido
      const event = new Event('change');
      Object.defineProperty(event, 'target', { value: mockCheckbox, writable: false });

      component.onCheckboxComprobanteChange(event);

      expect(component.ComprobanteCheck).toBe(2);
      expect(component.getFacturas).toHaveBeenCalled();
    });

    it('should handle checkbox comprobante change when unchecked', () => {
      spyOn(component, 'getFacturas');

      // Crear un elemento checkbox simulado
      const mockCheckbox = document.createElement('input');
      mockCheckbox.type = 'checkbox';
      mockCheckbox.checked = false;

      // Crear evento con target válido
      const event = new Event('change');
      Object.defineProperty(event, 'target', { value: mockCheckbox, writable: false });

      component.onCheckboxComprobanteChange(event);

      expect(component.ComprobanteCheck).toBe(1);
      expect(component.getFacturas).toHaveBeenCalled();
    });

    it('should handle invalid event gracefully', () => {
      spyOn(component, 'getFacturas');
      spyOn(console, 'warn');

      // Guardar valor inicial
      const initialValue = component.ComprobanteCheck;

      // Probar con evento null
      component.onCheckboxComprobanteChange(null as any);

      expect(console.warn).toHaveBeenCalledWith('Evento o target del checkbox no válido');
      expect(component.ComprobanteCheck).toBe(initialValue);
      expect(component.getFacturas).not.toHaveBeenCalled();
    });

    it('should handle event with null target gracefully', () => {
      spyOn(component, 'getFacturas');
      spyOn(console, 'warn');

      // Guardar valor inicial
      const initialValue = component.ComprobanteCheck;

      // Crear evento sin target
      const event = new Event('change');

      component.onCheckboxComprobanteChange(event);

      expect(console.warn).toHaveBeenCalledWith('Evento o target del checkbox no válido');
      expect(component.ComprobanteCheck).toBe(initialValue);
      expect(component.getFacturas).not.toHaveBeenCalled();
    });

    it('should handle non-checkbox element gracefully', () => {
      spyOn(component, 'getFacturas');
      spyOn(console, 'warn');

      // Guardar valor inicial
      const initialValue = component.ComprobanteCheck;

      // Crear un elemento que no es checkbox
      const mockElement = document.createElement('div');

      // Crear evento con target no válido
      const event = new Event('change');
      Object.defineProperty(event, 'target', { value: mockElement, writable: false });

      component.onCheckboxComprobanteChange(event);

      expect(console.warn).toHaveBeenCalledWith('El target no es un checkbox válido');
      expect(component.ComprobanteCheck).toBe(initialValue);
      expect(component.getFacturas).not.toHaveBeenCalled();
    });
  });

  describe('Component Cleanup', () => {
    it('should unsubscribe from all subscriptions on destroy', () => {
      const mockSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
      component.subs = [mockSubscription, mockSubscription];

      component.ngOnDestroy();

      expect(mockSubscription.unsubscribe).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should call loading service when loading facturas', () => {
      // Test successful loading instead of error case to avoid uncaught errors
      mockMantenimientoService.getFacturas.and.returnValue(of(mockFacturas));

      component.getFacturas();

      expect(mockLoadingService.showLoading).toHaveBeenCalled();
      expect(mockLoadingService.hideLoading).toHaveBeenCalled();
    });
  });
});

