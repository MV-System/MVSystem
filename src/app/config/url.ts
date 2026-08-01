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
            NotaCredito: API + 'NotaCredito/PostNotaCreditoProveedor2',
            NotaCreditoReporte: API + 'NotaCredito/ReportNotaCredito',
        },
        Consulta:{
            Facturas: API + 'Factura/GetFacturas',
            DetalleFactura: API + 'Factura/GetDetalleFactura',
            GetDesglosePagos: API + 'Factura/GetDesglosePagos',
            FacturaNumero: API + 'Factura/GetFacturaNumeroUltimo',
        },
        Actualiza:{
          DetalleFactura: API + 'Factura/EditaDetalleFactura',
          DetalleFacturaRebajaEquipo: API + 'Factura/DetalleFacturaRebajaEquipo',
        },
        Reporte:{
            CierreCaja: API + 'FacturacionReporte/CierreCajaReport',
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
            EquiposRecibidos: API + 'Equipos/GetRecepcionEquipos?criterio=',
            EquiposReparaciones: API + 'Equipos/GetReparaciones?',
            ReparacionesLista: API + 'Equipos/GetReparaciones_Lista',
            ReparacionDetalle: API + 'Equipos/GetReparacion_Detalle'
        },
        Modifica: {
            ModificarEstatusEquipo: API + 'Equipos/ModificarEstatusEquipo',
            EstadoActualiza: API + 'Equipos/EstadoActualiza'
        },
        Actualiza: {
            ReparacionCostoPrecio: API + 'Equipos/ActualizarCostoPrecioReparacion'
        },
        Accion: {
          EquipoRecibidosReporte:  API + 'EquipoReporte/GetEquiposRecibidoVistaReporte?criterio=',
          EquipoReparadoReporte:  API + 'EquipoReporte/ReporteReparaciones',
          PostEquipo_Delete:  API + 'Equipos/PostEquipo_Delete',
          EquipoRegistradosReporte: API + 'EquipoReporte/ReporteEquiposRegistrados'
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
        canalesLista: API + 'Catalogos/Canales_Combo',
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
        statusTallerLista: API + 'Catalogos/GetStatusTaller',
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
        },
        Accion: {
          ReciboAbono: API + 'ClientesReporte/ReciboAbono',
          ReciboAbonoGeneral: API + 'ClientesReporte/ReciboAbonoGeneral',
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
    Dashboard: {
        ResumenInteligente: API + 'Dashboard/ResumenInteligente',
        TopProductos: API + 'Dashboard/TopProductos',
        AlertasInteligentes: API + 'Dashboard/AlertasInteligentes',
        PrediccionVentas: API + 'Dashboard/PrediccionVentas',
        RentabilidadCategorias: API + 'Dashboard/RentabilidadCategorias',
        PatronActividad: API + 'Dashboard/PatronActividad',
        RecomendacionesPersonalizadas: API + 'Dashboard/RecomendacionesPersonalizadas',
        ComparacionPeriodos: API + 'Dashboard/ComparacionPeriodos',
        DeteccionAnomalias: API + 'Dashboard/DeteccionAnomalias',
        MarcarAlertaLeida: API + 'Dashboard/Alertas/MarcarLeida',
        ResumenEjecutivo: API + 'Dashboard/ResumenEjecutivo'
    },
    Login: {
        Login: API + 'login/login',
        ChangePassword: API + 'login/ChangePassword',
    },
    PreFacturas: {
        Crear: API + 'PreFacturas',
        AgregarDetalle: API + 'PreFacturas/detalle',
        Listar: API + 'PreFacturas',
        Detalle: API + 'PreFacturas', // Usar como `${APIURL.PreFacturas.Detalle}/${id}/detalle`
        Procesar: API + 'PreFacturas', // Usar como `${APIURL.PreFacturas.Procesar}/${id}/procesar`
        Anular: API + 'PreFacturas',   // Usar como `${APIURL.PreFacturas.Anular}/${id}/anular`
    },
    Inventario: {
        IniciarSesion: API + 'api/Inventario/IniciarSesion',
        RegistrarEscaneo: API + 'api/Inventario/RegistrarEscaneo',
        Pendientes: API + 'api/Inventario/Pendientes',
        Escaneados: API + 'api/Inventario/Escaneados',
        Finalizar: API + 'api/Inventario/Finalizar',
        Sesion: API + 'api/Inventario/Sesion',
        Pausar: API + 'api/Inventario/Pausar',
        Reanudar: API + 'api/Inventario/Reanudar',
        Activos: API + 'api/Inventario/Activos',
        Cancelar: API + 'api/Inventario/Cancelar',
        Faltantes: API + 'api/Inventario/Faltantes',
        Sobrantes: API + 'api/Inventario/Sobrantes',
    },
    //}
}
