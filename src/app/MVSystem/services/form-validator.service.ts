import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormValidatorService {

  constructor() { }
  
  validarPrecioMayorCero(control: FormControl): ValidationErrors | null{
    if(control.value < 1.00){
      return {
        percioMayorCero: "El precio debe ser mayor a 0"
      }
    }
    return null;
 }

 validarPrecio(campoNombre1: string, campoNombre2: string) {
  return (formGroup: FormGroup): ValidationErrors | null => {
     let campoMenor = formGroup.get(campoNombre1);
     let campoMayor = formGroup.get(campoNombre2);
     if(campoMenor?.value >= campoMayor?.value){
      campoMayor?.setErrors({ajustarPrecios:true})
      return {
        ajustarPrecios: true
      }
     }else if(campoMayor?.value >= campoMenor?.value){
      campoMayor?.setErrors(null)
     }
    return null;
  }
 }
}
