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
    Cotizacion:{
        Consulta:{
            CotizacionFacturaConsulta: API + 'Cotizacion/GetCotizacionFacturaConsulta',
            DetalleCotizacionConsulta: API + 'Cotizacion/GetDetalleCotizacionConsulta',
        }
    },
    Factura: {
        Inserta: {
            FacturaInserta: API + 'Factura/PostFactura',
            FacturaReporteConsulta: API + 'FacturacionReporte/ReportFacturaConsulta',
            FacturacionReporte: API + 'FacturacionReporte/RptFactura',
            FacturaReporte: API + 'FacturacionReporte/ReportFactura',
            FacturaReporteMini: API + 'FacturacionReporte/ReportFacturaMini',
            ReportCotizacion: API + 'FacturacionReporte/ReportCotizacion',
            AnulaFactura: API + 'Factura/PostAnulaFactura',
        },
        Consulta:{
            Facturas: API + 'Factura/GetFacturas',
            DetalleFactura: API + 'Factura/GetDetalleFactura',
            FacturaNumero: API + 'Factura/GetFacturaNumeroUltimo',
        },
        Actualiza:{
          DetalleFactura: API + 'Factura/EditaDetalleFactura',
          DetalleFacturaRebajaEquipo: API + 'Factura/DetalleFacturaRebajaEquipo',
      }
    },
    Equipo: {
        Inserta: {
            EquipoInserta: API + 'Equipos/Equipo_Insert',
            EquipoDisponibleReporteInserta: API + 'EquipoReporte/EquipoDisponibleReporte/GetEquiposDisponible',
            EquipoVendidoReporteInserta: API + 'EquipoReporte/EquipoVendidoReporte/GetEquiposVendidos',
            EquipoTransferenciaReporteInserta: API + 'EquipoReporte/EquipoTransferenciaReporte',
            EquipoTransferenciaInserta: API + 'Equipos/PostEquipoTransferencia',
            EquipoRecepcion: API + 'Equipos/RecepcionEquipos',
            EquipoInsertaReparacion: API + 'Equipos/PostReparacionEquipo'
        },
        Consulta: {
            EquipoNumeroRegistro: API + 'Equipos/Numero_Registro',
            EquipoDisponible: API + 'Equipos/GetEquiposDisponible',
            EquipoDisponibleFT: API + 'Equipos/Equipo_Busca_Disponible',
            EquipoBuscaDisponible: API + 'Equipos',
            EquipoVendido: API + 'Equipos/GetEquiposVendidos',
            EquipoTransferenciasConsulta: API + 'Equipos/GetTransferenciaEquipos',
            EquipoTransferenciasDetalleConsulta: API + 'Equipos/GetDetalleTransferenciaEquipos',
            EquipoModificarEstatus: API + 'Equipos/GetEquipoPreciosEstatusByImei',
            EquipoTransferencia: API + 'Equipos/GetEquipoByImei',
            EquipoTransferenciaId: API + 'Equipos/GetEquipoUltimoIdTransferencia',
            EquiposRecibidos: API + 'Equipos/RecepcionEquipos?criterio=',
            EquiposReparaciones: API + 'Equipos/GetReparaciones?'
        },
        Modifica: {
            ModificarEstatusEquipo: API + 'Equipos/ModificarEstatusEquipo',
            EstadoActualiza: API + 'Equipos/EstadoActualiza'
        },
        Accion: {
          EquipoRecibidosReporte:  API + 'EquipoReporte/GetEquiposRecibidoVistaReporte?criterio=',
          EquipoReparadoReporte:  API + 'EquipoReporte/ReporteReparaciones',
          PostEquipo_Delete:  API + 'Equipos/PostEquipo_Delete'
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
            ClientesConFacturasPendientes: API + 'Clientes/GetClientesConFacturasPendientes',
            FacturasPendientesPorCliente: API + 'Clientes/GetFacturasPendientesPorCliente',
        },
        Inserta: {
          ClienteInserta: API + 'Clientes/Cliente_Insert',
          AbonoFactura: API + 'Clientes/AbonoAfactura',
          AbonoGeneral: API + 'Clientes/AbonoGeneral',
        },
        Edita: {
          ClienteUpdate: API + 'Clientes/Cliente_Update',
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
    Utilidades: {
      GetUtilidades: API + 'Utilidades/GetUtilidades',

  },
    Login: {
        Login: API + 'login/login',
        ChangePassword: API + 'login/ChangePassword',
    },
    //}
}
