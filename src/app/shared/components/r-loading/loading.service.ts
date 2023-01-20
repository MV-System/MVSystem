import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  isLoading:Subject<boolean> = new Subject<boolean>();
  private message:string = "Cargando...";

  constructor() { 
  }

  showLoading(message:string = 'Cargando...'){
    this.message = message;
    this.isLoading.next(true);
  }

  hideLoading(){
    this.isLoading.next(false);
    this.message = 'Cargando...';
  }

  public get Message():string{
      return this.message;
  }
}
