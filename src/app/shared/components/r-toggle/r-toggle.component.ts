import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'r-toggle',
  templateUrl: './r-toggle.component.html',
  styleUrls: ['./r-toggle.component.css']
})
export class RToggleComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  @Input() dataOn:string = "data on";
  @Input() dataOff:string = "data off";
  @Output() onToggle = new EventEmitter<boolean>();

  onChange(e:any){
    this.onToggle.emit(e.target.checked);
  }
}
