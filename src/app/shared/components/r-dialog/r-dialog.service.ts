import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

interface Dialog{
    title:string ;
    message:string  ;
    btnCancelText :string  ;
    btnConfirmText:string  ;
    onConfirm:Function ;
    onCancel:Function ;
}

@Injectable({
    providedIn:'root'
})
export class RDialogService {
  constructor() { }
  dialogData = new Subject<Dialog>()
  private title:string = 'title';
//   private message:string = '';
//   private btnCancelText :string = '';
//   private btnConfirmText:string = '';
  onConfirm:Function = ()=>{}
  onCancel:Function = ()=>{}

    public openDialog(
        title:string, 
        message:string, 
        onConfirm:Function, 
        onCancel:Function = ()=>{}, 
        btnCancelText:string= 'Cancelar',
        btnConfirmText:string = 'Continuar'){

            const dialogData: Dialog ={
                title,
                message,
                onConfirm,
                onCancel,
                btnCancelText,
                btnConfirmText
            }
        // this.message = message;
        console.log(onConfirm);
        console.log(onCancel);
        
        this.onConfirm = onConfirm;
        this.onCancel = onCancel;
        // this.btnCancelText = btnCancelText;
        // this.btnConfirmText = btnConfirmText;
        
        this.dialogData.next( dialogData );
    }

    
}