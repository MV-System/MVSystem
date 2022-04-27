import { environment } from '../../environments/environment';

export let SERVER = environment.servername;
let API = environment.api;
export let APIURL = {
    tipoTelefonoLista: API + 'Catalogos/Tipo_Telefono_Combo',
    Clientes:{
        Consultas:{
            tipoClienteLista: API + 'Catalogos/Tipo_Cliente_Combo',
        },
        Inserta:{
            ClienteInserta: API + 'Clientes/Cliente_Insert',
        }
    },    
    Proveedor:{
        Consultas:{
            tipoProveedorLista: API + 'Catalogos/Tipo_suplidor_Combo',
        },
        Inserta:{
            ProveedorInserta: API + 'Proveedores/Proveedor_Insert',
        }
    },
    Vendedor:{
        Consultas:{
            
        },
        Inserta:{
            vendedorInserta: API + 'Vendedores/Vendedor_Insert'
        }
        
    }
}