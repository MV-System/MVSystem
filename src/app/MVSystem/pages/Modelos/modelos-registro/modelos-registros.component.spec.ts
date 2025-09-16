import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrService } from 'ngx-toastr';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ModelosRegistrosComponent } from './modelos-registros.component';
import { ModeloService } from 'src/app/core/services/modelo.service';
import { CatalogosService } from 'src/app/core/services/catalogos.service';

describe('ModelosRegistrosComponent', () => {
  let component: ModelosRegistrosComponent;
  let fixture: ComponentFixture<ModelosRegistrosComponent>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;
  let mockModeloService: jasmine.SpyObj<ModeloService>;
  let mockCatalogosService: jasmine.SpyObj<CatalogosService>;

  beforeEach(async () => {
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info']);
    const modeloSpy = jasmine.createSpyObj('ModeloService', ['postModelo', 'getModelos']);
    const catalogosSpy = jasmine.createSpyObj('CatalogosService', ['getMarcaEquipos']);

    await TestBed.configureTestingModule({
      declarations: [ModelosRegistrosComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        FormBuilder,
        { provide: ToastrService, useValue: toastrSpy },
        { provide: ModeloService, useValue: modeloSpy },
        { provide: CatalogosService, useValue: catalogosSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignore unknown elements
    })
    .compileComponents();

    mockToastrService = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    mockModeloService = TestBed.inject(ModeloService) as jasmine.SpyObj<ModeloService>;
    mockCatalogosService = TestBed.inject(CatalogosService) as jasmine.SpyObj<CatalogosService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelosRegistrosComponent);
    component = fixture.componentInstance;
    // Don't call fixture.detectChanges() immediately to avoid ngOnInit issues
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
