import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Accesorio } from '../../../../interfaces/accesorio.interface';

@Component({
  selector: 'app-accesorio-edit',
  templateUrl: './accesorio-edit.component.html',
  styleUrls: ['./accesorio-edit.component.css']
})
export class AccesorioEditComponent implements OnInit {
  constructor(private fb:FormBuilder) { }
  
  ngOnInit(): void {
  console.log(this.accesorio);
  }
  form: FormGroup = this.fb.group({
    descripcion:[''],
  })
 @Input() accesorio!:Accesorio;
 getAccesorioForEdit(){
  let desc= this.accesorio.descripcionAccesorio;
  this.form.get('descripcion')?.setValue(desc);


 }
}
