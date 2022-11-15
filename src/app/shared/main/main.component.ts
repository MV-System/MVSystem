import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  template: `
    <main id="main" class="main">
      <div class="pagetitle">
        <h1 id="registro">{{title}}</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/">Home</a></li>
            <li class="breadcrumb-item" *ngIf="breadcrumb">{{breadcrumb}}</li>
            <li class="breadcrumb-item active">{{breadcrumbItem}}</li>
          </ol>
        </nav>
      </div>
  <ng-content></ng-content>
  </main>`
})
export class MainComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  @Input() title:any;
  @Input() breadcrumb:any;
  @Input() breadcrumbItem:any;
}
