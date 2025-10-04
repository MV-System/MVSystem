import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of, Subject } from 'rxjs';

import { FacturacionListaComponent } from './facturacion-lista.component';
import { VendedorService } from 'src/app/core/services/vendedor.service';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { LoginService } from 'src/app/auth/login.service';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { RDialogService } from 'src/app/shared/components/r-dialog/r-dialog.service';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';
import { FacturaConsulta, DetalleFacturaList } from 'src/app/core/interfaces/mantenimiento';
import { Equipo } from 'src/app/core/interfaces/equipo.interface';

describe('FacturacionListaComponent', () => {
  let component: FacturacionListaComponent;
  let fixture: ComponentFixture<FacturacionListaComponent>;
  let mockVendedorService: jasmine.SpyObj<VendedorService>;
  let mockMantenimientoService: jasmine.SpyObj<MantenimientoService>;
  let mockLoginService: jasmine.SpyObj<LoginService>;
  let mockValidatorPermissionService: jasmine.SpyObj<ValidatorPermissionService>;
  let mockCatalogosService: jasmine.SpyObj<CatalogosService>;
  let mockRDialogService: jasmine.SpyObj<RDialogService>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;

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

  beforeEach(async () => {
    // Crear spies para todos los servicios
    mockVendedorService = jasmine.createSpyObj('VendedorService', ['getVendedorLista']);
    mockMantenimientoService = jasmine.createSpyObj('MantenimientoService', [
      'EditaDetalleFactura',
      'postAnlaFactura',
      'DetalleFacturaRebajaEquipo'
    ]);
    mockLoginService = jasmine.createSpyObj('LoginService', ['getUserName'], {
      getUserIdSucursal: '1',
      getUserEmpresa: 'Test Company',
      getUserIdEmpresa: '1'
    });
    mockValidatorPermissionService = jasmine.createSpyObj('ValidatorPermissionService', [
      'validateUserRole'
    ]);
    mockCatalogosService = jasmine.createSpyObj('CatalogosService', [
      'buscarEquipoDisponible'
    ]);
    mockRDialogService = jasmine.createSpyObj('RDialogService', ['openDialog']);
    mockLoadingService = jasmine.createSpyObj('LoadingService', ['showLoading', 'hideLoading']);
    mockToastrService = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info']);

    // Configurar valores de retorno por defecto
    mockVendedorService.getVendedorLista.and.returnValue(of([]));
    mockLoginService.getUserName.and.returnValue('testuser');
    mockValidatorPermissionService.validateUserRole.and.returnValue(true);
    
    // Mock completo para Equipo
    const mockEquipo: Partial<Equipo> = {
      disponible: 'S',
      mensaje: 'Disponible',
      imei: 'IMEI123456789',
      ID_Modelo: 1,
      ID_Tecnologia: 1,
      ID_Garantia: 1,
      ID_Almacen: 1,
      ID_Suplidor: 1,
      Numero_de_Factura: '12345',
      Precio_Por_Mayor: 800,
      Precio_Detalle: 1000,
      Costo_Equipo: 700,
      Desbloqueado: 'S',
      Usuario: 'testuser',
      Comision_Por_Mayor: 50,
      Comision_Detalle: 100,
      marca: 'Samsung',
      modelo: 'Galaxy S21',
      precioPorMayor: 800,
      precioDetalle: 1000
    };
    
    mockCatalogosService.buscarEquipoDisponible.and.returnValue(of(mockEquipo as Equipo));

    await TestBed.configureTestingModule({
      declarations: [FacturacionListaComponent],
      imports: [
        FormsModule,
        NgxPaginationModule,
        ToastrModule.forRoot()
      ],
      providers: [
        { provide: VendedorService, useValue: mockVendedorService },
        { provide: MantenimientoService, useValue: mockMantenimientoService },
        { provide: LoginService, useValue: mockLoginService },
        { provide: ValidatorPermissionService, useValue: mockValidatorPermissionService },
        { provide: CatalogosService, useValue: mockCatalogosService },
        { provide: RDialogService, useValue: mockRDialogService },
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: ToastrService, useValue: mockToastrService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FacturacionListaComponent);
    component = fixture.componentInstance;

    // Configurar inputs requeridos
    component.pageSize = 10;
    component.pageIndex = 1;
    component.totalRecord = 1;
    component.currentPage = 1;
    component.line = 1;
    component.lastLine = 1;
    component.facturas = mockFacturas;
    component.detalleFactura = mockDetalleFactura;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.selectedRowIndex).toBeNull();
      expect(component.facturaVisibility).toEqual({});
      expect(component.isLoading).toBeFalse();
      expect(component.criterio).toBe('');
      expect(component.minSearchLength).toBe(1);
      expect(component.debounceTime).toBe(800);
    });

    it('should setup search optimization on init', () => {
      spyOn(component as any, 'setupSearchOptimization');
      component.ngOnInit();
      expect((component as any).setupSearchOptimization).toHaveBeenCalled();
    });
  });

  describe('Page Size Functionality', () => {
    it('should emit page size change event', () => {
      spyOn(component.pageSizeChanged, 'emit');
      component.pageSize = 25;
      
      component.onPageSizeChange();
      
      expect(component.pageSizeChanged.emit).toHaveBeenCalledWith(25);
    });
  });

  describe('Factura Selection and Visibility', () => {
    it('should handle click and set selected row index', () => {
      spyOn(component, 'getIdFactura');
      spyOn(component, 'toggleDetalleFactura');
      
      component.handleClick(1001, 0);
      
      expect(component.getIdFactura).toHaveBeenCalledWith(1001, 0);
      expect(component.toggleDetalleFactura).toHaveBeenCalledWith(1001);
      expect(component.selectedRowIndex).toBe(0);
    });

    it('should toggle factura visibility', () => {
      const facturaId = 1001;
      
      // Initially should be undefined/false
      expect(component.facturaVisibility[facturaId]).toBeFalsy();
      
      component.toggleDetalleFactura(facturaId);
      expect(component.facturaVisibility[facturaId]).toBeTrue();
      
      component.toggleDetalleFactura(facturaId);
      expect(component.facturaVisibility[facturaId]).toBeFalse();
    });

    it('should emit factura button and numero factura events', () => {
      spyOn(component.onFacturaButton, 'emit');
      spyOn(component.numerofactura, 'emit');
      
      component.getIdFactura(1001, 0);
      
      expect(component.onFacturaButton.emit).toHaveBeenCalledWith(true);
      expect(component.numerofactura.emit).toHaveBeenCalledWith(1001);
      expect(component.selectedRowIndex).toBe(0);
      expect(component.index).toBe(0);
    });
  });

  describe('Search Functionality', () => {
    it('should trigger search with debounce', fakeAsync(() => {
      spyOn(component.onBuscarFacturas, 'emit');
      component.criterio = 'test';
      
      // Simular input event
      const event = new Event('input');
      Object.defineProperty(event, 'target', {
        value: { value: 'test' },
        enumerable: true
      });
      
      component.onSearchInput(event);
      
      // No debe emitir inmediatamente
      expect(component.onBuscarFacturas.emit).not.toHaveBeenCalled();
      
      // Después del debounce time
      tick(800);
      
      expect(component.onBuscarFacturas.emit).toHaveBeenCalledWith({
        criterio: 'test',
        pageIndex: 1
      });
    }));

    it('should execute search immediately on Enter key', () => {
      spyOn(component.onBuscarFacturas, 'emit');
      component.criterio = 'test';
      
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(event, 'preventDefault');
      
      component.onSearchKeydown(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.onBuscarFacturas.emit).toHaveBeenCalledWith({
        criterio: 'test',
        pageIndex: 1
      });
    });

    it('should clear search', () => {
      spyOn(component.onBuscarFacturas, 'emit');
      component.criterio = 'test';
      
      component.clearSearch();
      
      expect(component.criterio).toBe('');
      expect(component.onBuscarFacturas.emit).toHaveBeenCalledWith({
        criterio: '',
        pageIndex: 1
      });
    });

    it('should search manually', () => {
      spyOn(component.onBuscarFacturas, 'emit');
      component.criterio = 'manual test';
      
      component.searchManually();
      
      expect(component.onBuscarFacturas.emit).toHaveBeenCalledWith({
        criterio: 'manual test',
        pageIndex: 1
      });
    });
  });

  describe('Permission Validation', () => {
    it('should validate anular factura permission', () => {
      mockValidatorPermissionService.validateUserRole.and.returnValue(true);
      
      const result = component.btnAnulaFactura();
      
      expect(mockValidatorPermissionService.validateUserRole)
        .toHaveBeenCalledWith('VNT_DETALLE_FACTURA_BTN_ANULAR');
      expect(result).toBeTrue();
    });

    it('should return false when user has no permission', () => {
      mockValidatorPermissionService.validateUserRole.and.returnValue(false);
      
      const result = component.btnAnulaFactura();
      
      expect(result).toBeFalse();
    });
  });

  describe('Mobile Screen Detection', () => {
    it('should detect mobile screen correctly', () => {
      // Mock window.innerWidth
      spyOnProperty(window, 'innerWidth', 'get').and.returnValue(500);
      
      expect(component.isMobileScreen()).toBeTrue();
    });

    it('should detect desktop screen correctly', () => {
      spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1024);
      
      expect(component.isMobileScreen()).toBeFalse();
    });
  });

  describe('Detalle Factura Edit Mode', () => {
    it('should enter edit mode correctly', () => {
      const detalle = { ...mockDetalleFactura[0] };
      
      component.onEdit(detalle);
      
      expect(detalle.EquipoActual).toBe('IMEI123456789');
      expect(detalle.editMode).toBeTrue();
    });

    it('should cancel edit mode and restore original value', () => {
      const detalle = { ...mockDetalleFactura[0] };
      detalle.editMode = true;
      detalle.EquipoActual = 'ORIGINAL123';
      detalle.idEquipo = 'MODIFIED123';
      
      component.onCancel(detalle);
      
      expect(detalle.idEquipo).toBe('ORIGINAL123');
      expect(detalle.editMode).toBeFalse();
    });
  });

  describe('Input Changes', () => {
    it('should sync criterio when criterioInput changes', () => {
      const changes = {
        criterioInput: {
          currentValue: 'new search term',
          previousValue: '',
          firstChange: false,
          isFirstChange: () => false
        }
      };
      
      spyOn((component as any).searchSubject, 'next');
      
      component.ngOnChanges(changes);
      
      expect(component.criterio).toBe('new search term');
      expect((component as any).searchSubject.next).toHaveBeenCalledWith('new search term');
    });

    it('should not trigger search if criterio is the same', () => {
      component.criterio = 'same term';
      const changes = {
        criterioInput: {
          currentValue: 'same term',
          previousValue: '',
          firstChange: false,
          isFirstChange: () => false
        }
      };
      
      spyOn((component as any).searchSubject, 'next');
      
      component.ngOnChanges(changes);
      
      expect((component as any).searchSubject.next).not.toHaveBeenCalled();
    });
  });

  describe('Component Cleanup', () => {
    it('should unsubscribe from observables on destroy', () => {
      const mockSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
      component.subs = [mockSubscription];
      component['searchSubscription'] = mockSubscription;
      
      spyOn((component as any).destroy$, 'next');
      spyOn((component as any).destroy$, 'complete');
      
      component.ngOnDestroy();
      
      expect((component as any).destroy$.next).toHaveBeenCalledWith(true);
      expect((component as any).destroy$.complete).toHaveBeenCalled();
      expect(mockSubscription.unsubscribe).toHaveBeenCalledTimes(2);
    });
  });
});