import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { EquipoDisponible } from "../interfaces/equipo.interface";
import { APIURL } from "src/app/shared/url";
import { Observable } from 'rxjs';

@Injectable({
    providedIn:'root'
})
export class EquipoService{
    
    constructor(private http: HttpClient) {}

    getEquipoDisponible():Observable<EquipoDisponible[]>{
        return this.http.get<EquipoDisponible[]>(APIURL.Mantenimiento.Equipo.Consulta.EquipoDisponible)
    }
}