import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'r-loading',
  templateUrl: './r-loading.component.html',
  styleUrls: ['./r-loading.component.css']
})
export class RLoadingComponent implements OnInit {
  isLoading:boolean = false;
  constructor( ) { }
  
  ngOnInit(): void {
    
          this.isLoading = !this.isLoading;
        
      
  }

}
