import { Component, OnInit } from '@angular/core';
import { LoadingService } from './loading.service';


@Component({
  selector: 'r-loading',
  templateUrl: './r-loading.component.html',
  styleUrls: ['./r-loading.component.css']
})
export class RLoadingComponent implements OnInit {

  constructor(private loadingService: LoadingService ) { }
  
  ngOnInit(): void {
    this.loadingService.isLoading
        .subscribe( loading => {
              this.isLoading = loading;
              this.message = this.loadingService.Message;
              this.detail = this.loadingService.Detail;
          })
  }
  isLoading:boolean = false;
  message:string = "";
  detail:string = "";
}
