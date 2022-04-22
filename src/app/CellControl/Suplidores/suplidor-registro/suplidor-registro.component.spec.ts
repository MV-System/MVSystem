import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuplidorRegistroComponent } from './suplidor-registro.component';

describe('SuplidorRegistroComponent', () => {
  let component: SuplidorRegistroComponent;
  let fixture: ComponentFixture<SuplidorRegistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuplidorRegistroComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuplidorRegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
