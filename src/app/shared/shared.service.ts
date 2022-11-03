import { Injectable } from "@angular/core";

@Injectable({
    providedIn:'root'
})

export class SharedService{
    toggle!: boolean;
    /**
     *
     */
    constructor() {
        console.log(this.toggle);
        
    }
}