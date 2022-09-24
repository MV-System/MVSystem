import {  Component, ElementRef, OnInit, ViewChild, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    


  }
  @ViewChild('toggleSidebarBtn') toggleSidebar!: ElementRef;


  onSidebarToggle = ()=>{
      const toggle =  document.querySelector('.toggle-sidebar');
      if (!toggle) {
        $('body').addClass('toggle-sidebar')   
      }
      else{
        $('body').removeClass('toggle-sidebar')
      }
  }
}
