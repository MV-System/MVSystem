import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-utilidades',
  templateUrl: './utilidades.component.html',
  styleUrls: ['./utilidades.component.css']
})
export class UtilidadesComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
  }
  UtilidadesForm: FormGroup = this.fb.group({

  });

}
