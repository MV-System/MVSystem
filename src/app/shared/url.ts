import { environment } from '../../environments/environment';

export let SERVER = environment.servername;
let API = environment.api;
export let APIURL = {
    Clientes:{
        Consultas:{
            tipoTelefonoLista: API + 'Catalogos/Tipo_Telefono_Combo',
            tipoClienteLista: API + 'Catalogos/Tipo_Cliente_Combo',
        },
        Inserta:{
            ClienteInserta: API + 'Clientes/Cliente_Insert',
        }
        
    }
}