import { environment } from '../../environments/environment';

let API = environment.api;
export let APIURL = {
    Mantenimiento:{
        Accesorio:{
            Inserta:{
                AccesorioInserta: API + 'Accesorios/Accesorio_Insert',
            }
        },
       
    }, 
    Catalogos:{
        tipoTelefonoLista: API + 'Catalogos/Tipo_Telefono_Combo',
        marcasLista:  API + 'Catalogos/Marcas_Combo',
        modeloLista:  API + 'Catalogos/Modelos_Combo',
        almacenLista: API + 'Catalogos/Almacen_Combo',
    },
    Clientes:{
        Consultas:{
            tipoClienteLista: API + 'Catalogos/Tipo_Cliente_Combo',
        },
        Inserta:{
            ClienteInserta: API + 'Clientes/Cliente_Insert',
        }
    },    
    Suplidor:{
        Consultas:{
            tipoSuplidorLista: API + 'Catalogos/Tipo_suplidor_Combo',
        },
        Inserta:{
            SuplidorInserta: API + 'Proveedores/Proveedor_Insert',
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