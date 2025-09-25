import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';

import { ClientesConsultaComponent } from './clientes-consulta.component';
import { ClientesService } from 'src/app/core/services/clientes.service';
import { Cliente } from 'src/app/core/interfaces/cliente.interface';

// Mock pipe para paginate
@Pipe({ name: 'paginate' })
class MockPaginatePipe implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}

describe('ClientesConsultaComponent', () => {
  let component: ClientesConsultaComponent;
  let fixture: ComponentFixture<ClientesConsultaComponent>;
  let mockClientesService: jasmine.SpyObj<ClientesService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;
  let mockActivatedRoute: any;

  // Mock data
  const mockClientes: Cliente[] = [
    {
      id_Cliente: 1,
      nombres: 'Juan',
      apellidos: 'Pérez',
      numero_de_telefono: 8091234567,
      tipo_de_Cliente: 'Por Mayor',
      iD_Canal: 1
    }
  ];

  beforeEach(async () => {
    const clientesServiceSpy = jasmine.createSpyObj('ClientesService', ['getClientesPorNombreTelefono']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info']);

    mockActivatedRoute = {
      params: of({}),
      queryParams: of({}),
      snapshot: { params: {} }
    };

    await TestBed.configureTestingModule({
      declarations: [ClientesConsultaComponent, MockPaginatePipe],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ClientesService, useValue: clientesServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ToastrService, useValue: toastrSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignore unknown elements and attributes
    }).compileComponents();

    mockClientesService = TestBed.inject(ClientesService) as jasmine.SpyObj<ClientesService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockToastrService = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientesConsultaComponent);
    component = fixture.componentInstance;

    // Setup default mock response for ngOnInit
    mockClientesService.getClientesPorNombreTelefono.and.returnValue(of(mockClientes));
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty client list before ngOnInit', () => {
      // Don't trigger change detection yet
      expect(component.listaClientes).toEqual([]);
    });

    it('should load all clients on init', () => {
      fixture.detectChanges(); // This triggers ngOnInit

      expect(mockClientesService.getClientesPorNombreTelefono).toHaveBeenCalledWith('');
      expect(component.listaClientes).toEqual(mockClientes);
    });
  });

  describe('Basic Methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have a form for search', () => {
      expect(component.formBusqueda).toBeDefined();
      expect(component.formBusqueda.get('criterio')).toBeDefined();
    });

    it('should have pagination property', () => {
      expect(component.page).toBe(1);
    });

    it('should change page correctly', () => {
      const newPage = 3;
      component.pageChanged(newPage);
      expect(component.page).toBe(newPage);
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should search clients by criteria', () => {
      const searchCriteria = 'Juan';
      const filteredClientes = [mockClientes[0]];

      mockClientesService.getClientesPorNombreTelefono.and.returnValue(of(filteredClientes));

      // Set form value
      component.formBusqueda.patchValue({ criterio: searchCriteria });

      component.obtenerClientesPorNombreTelefono();

      expect(mockClientesService.getClientesPorNombreTelefono).toHaveBeenCalledWith(searchCriteria);
      expect(component.listaClientes).toEqual(filteredClientes);
    });

    it('should clear search and reload all clients', () => {
      mockClientesService.getClientesPorNombreTelefono.and.returnValue(of(mockClientes));

      // Set some search criteria first
      component.formBusqueda.patchValue({ criterio: 'test' });

      component.limpiarBusqueda();

      // After reset(), the value becomes null, not empty string
      expect(component.formBusqueda.get('criterio')?.value).toBeNull();
      expect(mockClientesService.getClientesPorNombreTelefono).toHaveBeenCalledWith('');
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate to client detail', () => {
      const clienteId = 1;
      mockRouter.navigate.and.returnValue(Promise.resolve(true));

      component.verDetalle(clienteId);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['../detalle', clienteId], { relativeTo: mockActivatedRoute });
    });

    it('should navigate to client edit', () => {
      const clienteId = 1;
      mockRouter.navigate.and.returnValue(Promise.resolve(true));

      component.editarCliente(clienteId);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['../editar', clienteId], { relativeTo: mockActivatedRoute });
    });

    it('should navigate to add new client', () => {
      mockRouter.navigate.and.returnValue(Promise.resolve(true));

      component.agregarCliente();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['../registro'], { relativeTo: mockActivatedRoute });
    });
  });

  describe('Helper Methods - Extended', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should get client phone correctly with all field variations', () => {
      const cliente1 = { numero_de_telefono: 8091234567 } as Cliente;
      const cliente2 = { numero_de_telefono: 8097654321 } as Cliente;
      const cliente3 = { numero_de_telefono: 8095555555 } as Cliente;

      expect(component.getClienteTelefono(cliente1)).toBe(8091234567);
      expect(component.getClienteTelefono(cliente2)).toBe(8097654321);
      expect(component.getClienteTelefono(cliente3)).toBe(8095555555);
      expect(component.getClienteTelefono({} as Cliente)).toBe(0);
    });

    it('should get client last name correctly', () => {
      const cliente1 = { apellidos: 'Pérez' } as Cliente;
      const cliente2 = { apellidos: 'González' } as Cliente;

      expect(component.getClienteApellidos(cliente1)).toBe('Pérez');
      expect(component.getClienteApellidos(cliente2)).toBe('González');
      expect(component.getClienteApellidos({} as Cliente)).toBe('');
    });

    it('should get client type correctly', () => {
      const cliente1 = { tipo_de_Cliente: 'Por Mayor' } as Cliente;
      const cliente2 = { tipo_de_Cliente: 'Por Menor' } as Cliente;

      expect(component.getClienteTipoDescripcion(cliente1)).toBe('Por Mayor');
      expect(component.getClienteTipoDescripcion(cliente2)).toBe('Por Menor');
      expect(component.getClienteTipoDescripcion({} as Cliente)).toBe('');
    });
  });
});
