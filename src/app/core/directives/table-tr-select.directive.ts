import { Directive, ElementRef, HostListener, Renderer2 } from "@angular/core";

@Directive({
    selector:'[tableTrselect]'
})
export class TableTrselect{
    constructor(private el: ElementRef, private renderer: Renderer2) {
    }

  
}