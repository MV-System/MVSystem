import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../../services/login.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User } from '../../../interfaces/loginDTO.interface';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-password-change-page',
  templateUrl: './password-change-page.component.html',
  styleUrls: ['./password-change-page.component.css']
})
export class PasswordChangePageComponent implements OnInit {

  constructor(
    private loginService: LoginService,
    private fb: FormBuilder,
    private toastr: ToastrService) { }

  ngOnInit(): void {
  }
  messageAlertPassword: string ='';
  user!:User;
  showPassword = false;
  renewPasswordInput: boolean = false;
  isRenewPasswordError: boolean = false;
  sub!: Subscription[];
  form: FormGroup = this.fb.group({
    newPassword:['',Validators.compose([Validators.required])],
    renewPassword:['',Validators.compose([Validators.required])]
  })


  confirmPasswordMatch(controlName: string, matchingControlName: string) {    
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];

        // set error on matchingControl if validation fails
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ confirmPasswordMatch: true });
            console.log(matchingControl);
            
        } else {
            matchingControl.setErrors(null);
        }
    }
  } 
  onStrengthChange(strength: any) {

    
    console.log(strength)
  }
  validateFields(fieldName: string) {
    return (
      this.form.get(fieldName)?.invalid &&
      this.form.get(fieldName)?.touched
    );
  }
  validateFieldRenewPassword() {
   
     if(this.form.get('renewPassword')?.invalid &&
      this.form.get('renewPassword')?.touched && this.renewPasswordInput) {
        this.messageAlertPassword ='Este campo es requerido.';
        return true;
      }
      if(this.isRenewPasswordError){
        this.messageAlertPassword ='Las contraseñas no coinciden. !Inténtalo de nuevo!';
        return true
      }
    return false;
  }
  onActiveRenewPwdInput(e: any){
    this.renewPasswordInput = e 
  }
  toggleShowPassword(){
    this.showPassword = !this.showPassword;
  }
  changePasswordUser(){
    const { newPassword,renewPassword } = this.form.value;
    const model: User ={
      password: newPassword
    };
    if (newPassword === renewPassword) {
      
    let sub = this.loginService.changePwdUser(model).subscribe(() =>{
        this.toastr.success('Tu contraseña ha sido cambiada con éxito','');
      });
      console.log(sub);
      
      this.sub.push(sub);
    }
    else{
      this.isRenewPasswordError = true;
    }
  }

}
