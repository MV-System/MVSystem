import { Component, Input, OnInit } from '@angular/core';
import { RDialogService } from './r-dialog.service';

@Component({
  selector: 'app-r-dialog',
  templateUrl: './r-dialog.component.html',
  styleUrls: ['./r-dialog.component.css']
})
export class RDialogComponent implements OnInit {

  show: boolean = false;
  @Input() title: string = "";
  @Input() message!: string;
  @Input() btnOkText!: string;
  @Input() btnCancelText!: string;

  constructor(private rDialogService:RDialogService) { }

  ngOnInit() {
    this.rDialogService.dialogData.subscribe(resp=>{
      this.btnCancelText = resp.btnCancelText;
      this.btnOkText = resp.btnConfirmText;
      this.message = resp.message;
      this.title = resp.title;
      this.show = true
    })
  }
  onClose(){
    this.show = !this.show;
    this.rDialogService.onCancel()
  }
  onSubmit(){
    this.show = !this.show;
    this.rDialogService.onConfirm()
    
  }

}
