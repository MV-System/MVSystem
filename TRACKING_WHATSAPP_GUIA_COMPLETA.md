# 📋 GUÍA COMPLETA DE INSTALACIÓN Y CONFIGURACIÓN
## Sistema de Tracking con Notificaciones WhatsApp - MVSystem

---

## 📦 REQUISITOS PREVIOS

### Backend (.NET 6)
- ✅ .NET 6 SDK instalado
- ✅ SQL Server con base de datos SEGURIDAD
- ✅ Tabla `TrackingLogs` creada (ya ejecutado ✅)

### Microservicio Node.js
- ✅ Node.js v16 o superior
- ✅ npm o yarn
- ✅ Teléfono con WhatsApp para escanear QR

### Frontend (Angular)
- ✅ Proyecto Angular existente
- ✅ HttpClient configurado

---

## 🚀 PASO 1: CONFIGURAR BACKEND .NET

### 1.1 Agregar configuración a `appsettings.json`

Abre el archivo `appsettings.json` en tu proyecto API y agrega esta sección:

```json
{
  "ConnectionStrings": {
    "MVSystemSeguridad": "data source=cellcontroldesarrolloserver.database.windows.net;Initial catalog=SEGURIDAD;user id=cellcontroldesarrollouser;password=Laserpiente04;"
  },
  
  "WhatsApp": {
    "NodeExecutable": "node",
    "ScriptPath": "./WhatsAppNode/whatsapp-server.js",
    "NodeServerUrl": "http://localhost:3001",
    "NumeroNotificacion": "18091234567",
    "AutoStart": true
  },
  
  "Tracking": {
    "Enabled": true,
    "ModulosMonitoreados": [
      "Dashboard IA",
      "Equipos Disponibles",
      "Equipos Vendidos",
      "Facturas",
      "Configuración"
    ]
  }
}
```

**⚠️ IMPORTANTE:** Reemplaza `"18091234567"` con tu número de WhatsApp en formato internacional (sin + ni espacios).

---

### 1.2 Registrar servicios en `Startup.cs` o `Program.cs`

Si usas **Program.cs** (.NET 6 minimal API):

```csharp
// Agregar después de var builder = WebApplication.CreateBuilder(args);

// Registrar HttpClient para WhatsAppService
builder.Services.AddHttpClient<WhatsAppService>();

// Registrar servicios de tracking
builder.Services.AddScoped<IAccesoDatos, AccesoDatos>(); // Si no está ya
builder.Services.AddScoped<ITracking, Tracking_Negocio>();
builder.Services.AddSingleton<WhatsAppService>();

// ... resto del código
```

Si usas **Startup.cs** (.NET tradicional):

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // ... otros servicios
    
    services.AddHttpClient<WhatsAppService>();
    services.AddScoped<ITracking, Tracking_Negocio>();
    services.AddSingleton<WhatsAppService>();
    
    // ... resto
}
```

---

### 1.3 Iniciar servidor WhatsApp automáticamente

Agrega este código en `Program.cs` después de `var app = builder.Build();`:

```csharp
// Iniciar servidor WhatsApp al arrancar la API
var whatsappService = app.Services.GetRequiredService<WhatsAppService>();
var autoStart = builder.Configuration.GetValue<bool>("WhatsApp:AutoStart");

if (autoStart)
{
    _ = Task.Run(async () =>
    {
        await Task.Delay(3000); // Esperar 3 segundos
        await whatsappService.IniciarServidorWhatsApp();
    });
}
```

---

## 🚀 PASO 2: INSTALAR DEPENDENCIAS NODE.JS

Abre PowerShell y navega a la carpeta del microservicio:

```powershell
cd C:\mvsystem\MVSystemApi\MVSystemApi\WhatsAppNode
npm install
```

Esto instalará:
- ✅ express
- ✅ whatsapp-web.js
- ✅ qrcode-terminal
- ✅ cors
- ✅ body-parser

---

## 🚀 PASO 3: PRIMERA EJECUCIÓN Y VINCULACIÓN WHATSAPP

### 3.1 Ejecutar manualmente el servidor Node.js (primera vez)

```powershell
cd C:\mvsystem\MVSystemApi\MVSystemApi\WhatsAppNode
node whatsapp-server.js
```

### 3.2 Escanear código QR

1. **Aparecerá un código QR en la consola**
2. **Abre WhatsApp en tu teléfono**
3. **Ve a: Ajustes > Dispositivos vinculados > Vincular dispositivo**
4. **Escanea el QR de la consola**

Verás mensajes como:
```
✅ WhatsApp autenticado correctamente
✅ Cliente WhatsApp listo y conectado
📞 Servicio de notificaciones activo
```

### 3.3 Probar envío de mensaje

En otra terminal PowerShell:

```powershell
# Probar endpoint de status
Invoke-WebRequest -Uri "http://localhost:3001/status" -Method GET

# Enviar mensaje de prueba
$body = @{
    number = "18091234567"  # TU NÚMERO
    message = "🤖 Prueba desde MVSystem - Servicio activo!"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/send-message" -Method POST -Body $body -ContentType "application/json"
```

**✅ Si recibes el mensaje en WhatsApp, todo funciona correctamente!**

---

## 🚀 PASO 4: CONFIGURAR FRONTEND ANGULAR

### 4.1 Verificar que el servicio esté creado

El archivo ya fue creado en:
```
src/app/core/services/user-tracking.service.ts
```

### 4.2 Proveer el servicio en módulo principal

Abre `src/app/app.module.ts` y verifica que `HttpClientModule` esté importado:

```typescript
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    // ... otros imports
    HttpClientModule
  ]
})
export class AppModule { }
```

### 4.3 Usar el servicio en componentes

**Ejemplo 1: Rastrear acceso al Dashboard**

```typescript
// dashboard.component.ts
import { UserTrackingService } from '../../core/services/user-tracking.service';

export class DashboardComponent implements OnInit {
  
  constructor(
    private trackingService: UserTrackingService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    // Registrar acceso al módulo
    this.trackingService.trackPageView(
      'Dashboard IA',
      this.loginService.getUserName()
    );
    
    // ... resto del código
  }
}
```

**Ejemplo 2: Rastrear click en widget**

```typescript
// top-modelos-widget.component.ts
export class TopModelosWidgetComponent {
  
  constructor(private trackingService: UserTrackingService) {}

  verDetalleModelo(modelo: any): void {
    // Registrar interacción
    this.trackingService.trackAction(
      'Dashboard IA',
      'Click Widget Top Modelos',
      { modelo: modelo.modelo, ventas: modelo.totalVentas }
    );
    
    // ... abrir modal
  }
}
```

**Ejemplo 3: Rastrear búsqueda en equipos**

```typescript
// equipo-consulta-vendido.component.ts
obtenerEquiposVendidos(): void {
  // Registrar búsqueda
  this.trackingService.trackSearch(
    'Equipos Vendidos',
    this.txtBuscar,
    {
      fechaInicio: this.parametroEquipoVendido.fechainicio,
      fechaFinal: this.parametroEquipoVendido.fechafinal,
      pageSize: this.parametroEquipoVendido.pageSize
    }
  );
  
  // ... ejecutar búsqueda
}
```

---

## 🔧 PASO 5: CONFIGURACIÓN AVANZADA

### 5.1 Personalizar módulos que notifican

Edita el método `DebeNotificar` en `TrackingController.cs`:

```csharp
private bool DebeNotificar(string modulo, string accion)
{
    // Módulos que SIEMPRE envían notificación WhatsApp
    var modulosImportantes = new[]
    {
        "Dashboard IA",           // ← Agregar/quitar según necesites
        "Equipos Disponibles",
        "Facturas",
        "Configuración"
    };

    // Acciones específicas que notifican
    var accionesImportantes = new[]
    {
        "Acceso",                 // Cada vez que alguien accede
        "Crear",                  // Al crear registros
        "Eliminar",               // Al eliminar
        "Modificar Configuración" // Cambios críticos
    };

    return modulosImportantes.Contains(modulo) || accionesImportantes.Contains(accion);
}
```

### 5.2 Cambiar número de WhatsApp destino

Edita `appsettings.json`:

```json
"WhatsApp": {
  "NumeroNotificacion": "18291234567"  // ← Cambia aquí
}
```

### 5.3 Desactivar tracking temporalmente

En Angular:

```typescript
// Desactivar globalmente
this.trackingService.setTrackingEnabled(false);

// Reactivar
this.trackingService.setTrackingEnabled(true);
```

---

## 📊 USO DE ESTADÍSTICAS

### Obtener historial de tracking

```typescript
// En cualquier componente
this.trackingService.getHistory({
  usuario: 'admin',
  modulo: 'Dashboard IA',
  fechaDesde: new Date('2025-01-01'),
  top: 50
}).subscribe(response => {
  console.log(response.data);
});
```

### Obtener módulos más usados

```typescript
this.trackingService.getModuleStats().subscribe(response => {
  console.log('Estadísticas:', response.data);
  // { "Dashboard IA": 150, "Equipos Vendidos": 89, ... }
});
```

### Obtener usuarios más activos

```typescript
this.trackingService.getActiveUsers(10).subscribe(response => {
  console.log('Top usuarios:', response.data);
});
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "Servicio WhatsApp no está listo"

**Causa:** El servidor Node.js no está corriendo o no escaneaste el QR.

**Solución:**
```powershell
cd C:\mvsystem\MVSystemApi\MVSystemApi\WhatsAppNode
node whatsapp-server.js
# Escanear QR cuando aparezca
```

---

### ❌ Error: "El número no está registrado en WhatsApp"

**Causa:** El número no tiene WhatsApp o formato incorrecto.

**Solución:**
- Usa formato internacional: `18091234567` (sin +, espacios ni guiones)
- Verifica que el número tenga WhatsApp activo

---

### ❌ No llegan notificaciones

**Causa 1:** El método `DebeNotificar()` retorna `false`.

**Solución:** Revisa la configuración en `TrackingController.cs`.

**Causa 2:** El servicio WhatsApp está desconectado.

**Solución:** Verifica status:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/status"
```

---

### ❌ Error de conexión a base de datos

**Causa:** Connection string incorrecto.

**Solución:** Verifica en `appsettings.json`:
```json
"ConnectionStrings": {
  "MVSystemSeguridad": "data source=cellcontroldesarrolloserver.database.windows.net;Initial catalog=SEGURIDAD;user id=cellcontroldesarrollouser;password=Laserpiente04;"
}
```

---

## 📱 COMANDOS ÚTILES

### Verificar status de WhatsApp desde API

```http
GET http://localhost:5001/api/tracking/whatsapp/status
```

### Enviar notificación manual

```http
POST http://localhost:5001/api/tracking/notify
Content-Type: application/json

{
  "phoneNumber": "18091234567",
  "message": "Mensaje de prueba"
}
```

### Ver historial reciente

```http
GET http://localhost:5001/api/tracking/history?top=20
```

---

## 🎯 MÓDULOS RECOMENDADOS PARA MONITOREAR

| Módulo | Acción | ¿Notificar? |
|--------|--------|-------------|
| Dashboard IA | Acceso | ✅ Sí |
| Equipos Disponibles | Acceso | ✅ Sí |
| Equipos Vendidos | Búsqueda | ❌ No (mucho ruido) |
| Facturas | Crear/Eliminar | ✅ Sí |
| Configuración | Cualquier cambio | ✅ Sí |
| Reportes | Exportar | ⚠️ Opcional |

---

## ✅ CHECKLIST DE VERIFICACIÓN FINAL

- [ ] Tabla `TrackingLogs` existe en BD SEGURIDAD
- [ ] `appsettings.json` configurado con número WhatsApp
- [ ] Servicios registrados en `Program.cs`
- [ ] Dependencias Node.js instaladas (`npm install`)
- [ ] Servidor WhatsApp corriendo y QR escaneado
- [ ] `UserTrackingService` implementado en componentes
- [ ] Prueba de envío manual exitosa
- [ ] Revisar logs en tabla después de navegar

---

## 📞 SOPORTE

Si encuentras problemas:
1. Revisa los logs del servidor Node.js
2. Verifica logs de la API .NET
3. Consulta la tabla `TrackingLogs` directamente en SQL

---

**🎉 ¡Sistema de tracking configurado correctamente!**

Ahora recibirás notificaciones en WhatsApp cada vez que un usuario interactúe con los módulos configurados.
