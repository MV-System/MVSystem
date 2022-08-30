import { environment } from '../../environments/environment';

let API = environment.api;
export let APIURL = {
    //Mantenimiento:{

      Accesorio:{
            Inserta:{
                AccesorioInserta: API + 'Accesorios/Accesorio_Insert',
            },
        },

        Factura:{
            Inserta:{
                FacturaInserta: API + 'Factura/PostFactura',
            },
        },
        Equipo:{
           Inserta:{
            EquipoInserta: API + 'Equipos/Equipo_Insert',
           },

           Consulta:{
               EquipoNumeroRegistro: API + 'Equipos/Numero_Registro',
               EquipoDisponible: API + 'Equipos/GetEquiposDisponible',
               EquipoVendido: API + 'Equipos/GetEquiposVendidos',
           },
        },
        Marca:{
          Inserta:{
           MarcaInserta: API + 'Marcas/Marca_Insert',
          },
    },
    Catalogos:{
        tipoTelefonoLista: API + 'Catalogos/Tipo_Telefono_Combo',
        marcasLista:       API + 'Catalogos/Marcas_Combo',
        modeloLista:       API + 'Catalogos/Modelos_Combo',
        almacenLista:      API + 'Catalogos/Almacen_Combo',
        tipoFacturasLista: API + 'Catalogos/Tipos_Factura_Combo',
        tipoPagoLista:     API + 'Catalogos/Tipos_Pagos_Combo',
        tipoComprobanteLista: API + 'Catalogos/GetComprobantes_Combo',
        accesorioLista:       API + 'Catalogos/Accesorios_Facturacion_Lista',
        garantiaLista:        API + 'Catalogos/Garantias_Combo',
        desbloqueadoLista:    API + 'Catalogos/Desbloqueado_Combo',
        condicionEquipoLista: API + 'Catalogos/Condicion_Equipo_Combo',
        tecnologiasComboLista:API + 'Catalogos/Tecnologias_Combo',
        suplidorComboLista:   API + 'Catalogos/Suplidor_Combo',
    },
    Clientes:{
        Consultas:{
            tipoClienteLista: API + 'Catalogos/Tipo_Cliente_Combo',
            ClienteLista:     API + 'Clientes/Get_Cliente',
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
            vendedoresLista: API + 'Catalogos/Vendedores_Combo'

        },
        Inserta:{
            vendedorInserta: API + 'Vendedores/Vendedor_Insert'
        }

    }
//}
}
