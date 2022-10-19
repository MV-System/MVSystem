import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Accesorio } from '../../../../interfaces/accesorio.interface';
import { AccesoriosService } from '../../../../services/accesorios.service';
import { ToastrService } from 'ngx-toastr';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-accesorio-edit',
  templateUrl: './accesorio-edit.component.html',
  styleUrls: ['./accesorio-edit.component.css'],
})
export class AccesorioEditComponent implements OnInit, OnChanges {
  constructor(
    private fb: FormBuilder,
    private accesorioService: AccesoriosService,
    private toastr: ToastrService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.accesorio.currentValue) {
      this.onAccesorio = changes.accesorio.currentValue;
      this.getAccesorioForEdit();
    }
  }
  ngOnInit(): void { }
  form: FormGroup = this.fb.group({
    id:[''],
    descripcion: [''],
    codigo: [''],
    costoEquipo: [{ value: '', disabled: true }],
    cantidad: [''],
    descripcionAccesorio: [''],
    estado: [''],
    precioDetalle: [''],
    precioPorMayor: [''],
  });
  @Input() accesorio!: Accesorio;
  @Output() closeModal = new EventEmitter<void>()
  onAccesorio: any;
  //  isOpenModal = false;

  updateAccesorio() {
    this.msgValidacionesCamposFormDetallePorMayor();
    if (this.form.valid) {
      this.accesorioService.putAccesorio(this.form.value).subscribe(() => {
        this.toastr.success( 'Accesorio actualizado','Exito');
        this.closeModal.emit();
      });
    }
  }
  msgValidacionesCamposFormDetallePorMayor() {
    const {precioPorMayor, precioDetalle} = this.form.value
    if ( precioPorMayor > precioDetalle){
      this.form.setErrors({ error: '' });
      this.toastr.error(
        'El monto al por mayor, debe ser menor que el monto Al detalle',
        '',
        { closeButton: true, progressBar: true }
      );
    }
  }
  clearForm() {
    this.form.reset({
      costoEquipo:this.form.get('costoEquipo')?.value,
      estado:'Activo'
    });
  }
  setValuesFormeEdit(
    id:number,
    codigo: string,
    costoEquipo: number,
    cantidad: number,
    descripcionAccesorio: string,
    estado: string,
    precioDetalle: number,
    precioPorMayor: number
  ) {
    this.form.get('id')?.setValue(id);
    this.form.get('codigo')?.setValue(codigo);
    this.form.get('costoEquipo')?.setValue(costoEquipo);
    this.form.get('cantidad')?.setValue(cantidad);
    this.form.get('descripcionAccesorio')?.setValue(descripcionAccesorio);
    this.form.get('estado')?.setValue(estado);
    this.form.get('precioDetalle')?.setValue(precioDetalle);
    this.form.get('precioPorMayor')?.setValue(precioPorMayor);
  }
  getAccesorioForEdit() {
    this.setValuesFormeEdit(
      this.onAccesorio.id,
      this.onAccesorio.codigo,
      this.onAccesorio.costoEquipo,
      this.onAccesorio.cantidad,
      this.onAccesorio.descripcionAccesorio,
      this.onAccesorio.estado,
      this.onAccesorio.precioDetalle,
      this.onAccesorio.precioPorMayor
    );
  }
}
