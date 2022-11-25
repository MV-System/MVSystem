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
  user!:User;
  showPassword = false;
  renewPasswordInput: boolean = false;
  sub!: Subscription[];
  form: FormGroup = this.fb.group({
    newPassword:['',Validators.compose([Validators.required])],
    renewPassword:['',Validators.compose([Validators.required])],
    validator: this.confirmPasswordMatch('password', 'confirmPassword')
  })


  confirmPasswordMatch(controlName: string, matchingControlName: string) {    
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];

        // set error on matchingControl if validation fails
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ confirmPasswordMatch: true });
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
  onActiveRenewPwdInput(e: any){
    this.renewPasswordInput = e 
  }
  toggleShowPassword(){
    this.showPassword = !this.showPassword;
  }
  changePasswordUser(){
    const { newPassword } = this.form.value;
    const model: User ={
      password: newPassword
    };
   let sub = this.loginService.changePwdUser(model).subscribe(() =>{
      this.toastr.success('','Contraseña cambiada con exito');
    });
    this.sub.push(sub);
  }
}
