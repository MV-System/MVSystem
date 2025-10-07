import { Component, ElementRef, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'r-modal',
  templateUrl: './r-modal.component.html',
  styleUrls: ['./r-modal.component.css']
})
export class RModalComponent implements OnInit, OnChanges {

  @Input() super : boolean = false;
  @Input() show : boolean = true;
  @Input() largestWidth:boolean = false;
  @Input() title! : string;
  @Output() close = new EventEmitter<void>();


  constructor( private elRef: ElementRef) { }

  ngOnInit(): void {
    this.toggleBodyScroll();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show']) {
      this.toggleBodyScroll();
    }
  }

  ngOnDestroy(): void {
    // Asegurar que el scroll se reactive cuando se destruya el componente
    document.body.style.overflow = '';
  }

  private toggleBodyScroll(): void {
    if (this.show) {
      // Bloquear scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll del body cuando el modal está cerrado
      document.body.style.overflow = '';
    }
  }

  onClose(){
    this.close.emit();
  }

}
