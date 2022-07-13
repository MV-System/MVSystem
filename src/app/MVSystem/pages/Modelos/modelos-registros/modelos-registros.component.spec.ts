import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelosRegistrosComponent } from './modelos-registros.component';

describe('ModelosRegistrosComponent', () => {
  let component: ModelosRegistrosComponent;
  let fixture: ComponentFixture<ModelosRegistrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelosRegistrosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelosRegistrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
