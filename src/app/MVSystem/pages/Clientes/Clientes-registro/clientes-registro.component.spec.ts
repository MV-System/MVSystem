import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrService } from 'ngx-toastr';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ClientesRegistroComponent } from './clientes-registro.component';
import { LoginService } from 'src/app/auth/login.service';
import { ClientesService } from 'src/app/core/services/clientes.service';
import { CatalogosService } from 'src/app/core/services/catalogos.service';

describe('ClientesRegistroComponent', () => {
  let component: ClientesRegistroComponent;
  let fixture: ComponentFixture<ClientesRegistroComponent>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;
  let mockLoginService: jasmine.SpyObj<LoginService>;
  let mockClientesService: jasmine.SpyObj<ClientesService>;
  let mockCatalogosService: jasmine.SpyObj<CatalogosService>;

  beforeEach(async () => {
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info']);
    const loginSpy = jasmine.createSpyObj('LoginService', ['getUsuario']);
    const clientesSpy = jasmine.createSpyObj('ClientesService', ['postCliente']);
    const catalogosSpy = jasmine.createSpyObj('CatalogosService', ['getTipoTelefonos', 'getTipoClientes']);

    await TestBed.configureTestingModule({
      declarations: [ClientesRegistroComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        FormBuilder,
        { provide: ToastrService, useValue: toastrSpy },
        { provide: LoginService, useValue: loginSpy },
        { provide: ClientesService, useValue: clientesSpy },
        { provide: CatalogosService, useValue: catalogosSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignore unknown elements
    })
    .compileComponents();

    mockToastrService = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    mockLoginService = TestBed.inject(LoginService) as jasmine.SpyObj<LoginService>;
    mockClientesService = TestBed.inject(ClientesService) as jasmine.SpyObj<ClientesService>;
    mockCatalogosService = TestBed.inject(CatalogosService) as jasmine.SpyObj<CatalogosService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientesRegistroComponent);
    component = fixture.componentInstance;
    // Don't call fixture.detectChanges() immediately to avoid ngOnInit issues
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
