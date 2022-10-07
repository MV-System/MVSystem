import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'r-modal',
  templateUrl: './r-modal.component.html',
  styleUrls: ['./r-modal.component.css']
})
export class RModalComponent implements OnInit {

  @Input() super : boolean = false;
  @Input() show : boolean = true;
  @Input() title! : string;
  @Output() close = new EventEmitter<void>();


  constructor( private elRef: ElementRef) { }

  ngOnInit(): void {

  }

  onClose(){
    this.close.emit();
  }

}
