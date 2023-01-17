import { environment } from '../../environments/environment';

let API = environment.api;
export let APIURL = {
    //Mantenimiento:{

    Accesorio: {
        Inserta: {
            AccesorioInserta: API + 'Accesorios/Accesorio_Insert',
        },
        Consulta: {
            Accesorio: API + 'Accesorios/GetAccesorios',
            AccesorioById: API + 'Accesorios/GetAccesorioById',
            AccesorioVendidos: API + 'Accesorios/GetAccesoriosVendidos',
        },
        Edita:{
            AccesorioEdita: API + 'Accesorios/PutAccesorio',
        }
    },

    Factura: {
        Inserta: {
            FacturaInserta: API + 'FacturacionReporte/PostFactura',
            FacturaReporteConsulta: API + 'FacturacionReporte/ReportFacturaConsulta',
            FacturaReporte: API + 'FacturacionReporte/ReportFactura',
            ReportCotizacion: API + 'FacturacionReporte/ReportCotizacion',
        },
        Consulta:{
            Facturas: API + 'Factura/GetFacturas',
            DetalleFactura: API + 'Factura/GetDetalleFactura',
        }
    },
    Equipo: {
        Inserta: {
            EquipoInserta: API + 'Equipos/Equipo_Insert',
            EquipoDisponibleReporteInserta: API + 'EquipoReporte/EquipoDisponibleReporte/GetEquiposDisponible',
            EquipoVendidoReporteInserta: API + 'EquipoReporte/EquipoVendidoReporte/GetEquiposVendidos',
            EquipoTransferenciaReporteInserta: API + 'EquipoReporte/EquipoTransferenciaReporte',
            EquipoTransferenciaInserta: API + 'Equipos/PostEquipoTransferencia',
            EquipoRecepcion: API + 'Equipos/RecepcionEquipos'
        },
        Consulta: {
            EquipoNumeroRegistro: API + 'Equipos/Numero_Registro',
            EquipoDisponible: API + 'Equipos/GetEquiposDisponible',
            EquipoDisponibleFT: API + 'Equipos/Equipo_Busca_Disponible',
            EquipoBuscaDisponible: API + 'Equipos',
            EquipoVendido: API + 'Equipos/GetEquiposVendidos',
            EquipoModificarEstatus: API + 'Equipos/GetEquipoPreciosEstatusByImei',
            EquipoTransferencia: API + 'Equipos/GetEquipoByImei',
            EquipoTransferenciaId: API + 'Equipos/GetEquipoUltimoIdTransferencia',
            EquiposRecibidos: API + 'Equipos/RecepcionEquipos?criterio='
        },
        Modifica: {
            ModificarEstatusEquipo: API + 'Equipos/ModificarEstatusEquipo',
            EstadoActualiza: API + 'Equipos/EstadoActualiza'
        },
        Accion: {
            EquipoRecibidosReporte:  API + 'EquipoReporte/GetEquiposRecibidoVistaReporte?criterio='
        }
    },
    Marca: {
        Inserta: {
            MarcaInserta: API + 'Marcas/Marca_Insert',
        },
    },
    Modelo: {
        Inserta: {
            ModeloInserta: API + 'Marcas/Modelo_Insert',
        },
    },
    Catalogos: {
        tipoTelefonoLista: API + 'Catalogos/Tipo_Telefono_Combo',
        marcasLista: API + 'Catalogos/Marcas_Combo',
        modeloLista: API + 'Catalogos/Modelos_Combo',
        almacenLista: API + 'Catalogos/Almacen_Combo',
        sucursales: API + 'Catalogos/GetSucursales',
        tipoFacturasLista: API + 'Catalogos/Tipos_Factura_Combo',
        tipoPagoLista: API + 'Catalogos/Tipos_Pagos_Combo',
        tipoComprobanteLista: API + 'Catalogos/GetComprobantes_Combo',
        accesorioLista: API + 'Catalogos/Accesorios_Facturacion_Lista',
        garantiaLista: API + 'Catalogos/Garantias_Combo',
        desbloqueadoLista: API + 'Catalogos/Desbloqueado_Combo',
        condicionEquipoLista: API + 'Catalogos/Condicion_Equipo_Combo',
        tecnologiasComboLista: API + 'Catalogos/Tecnologias_Combo',
        suplidorComboLista: API + 'Catalogos/Suplidor_Combo',
        AsumeITBIS: API + 'Catalogos/AsumeITBIS',
    },
    Clientes: {
        Consultas: {
            tipoClienteLista: API + 'Catalogos/Tipo_Cliente_Combo',
            ClienteLista: API + 'Clientes/Get_Cliente',
        },
        Inserta: {
            ClienteInserta: API + 'Clientes/Cliente_Insert',
        }
    },
    Suplidor: {
        Consultas: {
            tipoSuplidorLista: API + 'Catalogos/Tipo_suplidor_Combo',
        },
        Inserta: {
            SuplidorInserta: API + 'Proveedores/Proveedor_Insert',
        }
    },
    Vendedor: {
        Consultas: {
            vendedoresLista: API + 'Catalogos/Vendedores_Combo'

        },
        Inserta: {
            vendedorInserta: API + 'Vendedores/Vendedor_Insert'
        }
    },
    Login: {
        Login: API + 'login/login',
        ChangePassword: API + 'login/ChangePassword',
    },
    //}
}
