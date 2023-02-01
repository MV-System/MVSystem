import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'r-toogle',
  templateUrl: './r-toogle.component.html',
  styleUrls: ['./r-toogle.component.css']
})
export class RToogleComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  @Input() dataOn:string = "data on";
  @Input() dataOff:string = "data off";
  @Output() onToogle = new EventEmitter<boolean>();

  onChange(e:any){
    this.onToogle.emit(e.target.checked);
  }
}
