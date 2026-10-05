# 🛵 FHS Multi-Project Ecosystem (React Native + Node.js)

Estructura modular dividida en **5 carpetas independientes**:

```
videos/
├── 🛒 cliente/          # Aplicación React Native Expo para el Usuario Final (Tienda & Domicilios Express)
├── 🛵 repartidor/       # Aplicación React Native Expo para el Repartidor (Radar, Pedidos, Pines ⭐)
├── 👔 administrador/    # Aplicación React Native Expo para la Torre de Control (Flota, Tiendas & Catálogos)
├── 🧪 prueba/           # Aplicación React Native Expo de Pruebas y Sandbox
├── 🖥️ servidor/         # Servidor Backend Central (Node.js + Express + REST API + SSE)
└── 📄 package.json      # Orquestador con scripts para ejecutar cualquiera de los proyectos
```

---

## 🖥️ 1. Servidor Central (`/servidor`)

El servidor central mantiene la base de datos en memoria y sincroniza en tiempo real las 4 aplicaciones móviles a través de su API REST y eventos en vivo (SSE), con un **sistema robusto de autenticación, control de roles (RBAC) y cumplimiento de estándares de seguridad (OWASP)**:

### 🛡️ Seguridad y Roles (RBAC)
- **Roles Soportados:** `administrador`, `repartidor`, `cliente`.
- **Cifrado de Contraseñas:** `bcryptjs` con 10 rondas de salt (nunca se almacenan ni retornan contraseñas en texto plano).
- **Estándar de Contraseñas (OWASP):** Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un caracter especial.
- **Tokens de Sesión:** JSON Web Tokens (**JWT** estándar RFC 7519) con algoritmo `HS256`, cabecera `Authorization: Bearer <token>` y expiración configurable (24h).
- **Cabeceras de Seguridad HTTP:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, `Strict-Transport-Security`.
- **Protección de Rutas por Rol:**
  - `POST /api/stores`, `POST /api/stores/:id/products`, `PATCH /api/auth/users/:id/role`: Exclusivo **Administrador**.
  - `POST /api/delivery-stars`, `PATCH /api/orders/:id/status`: **Repartidor** y **Administrador**.
  - `POST /api/orders`: **Cliente** y **Administrador**.

### 🔑 Cuentas Demo Preconfiguradas:
| Rol | Nombre | Correo | Contraseña |
| --- | --- | --- | --- |
| 👔 **administrador** | Laura Gómez (Admin) | `admin@fhs.com` | `Admin123!` |
| 🛵 **repartidor** | Carlos Mendoza (El Rayo) | `repartidor@fhs.com` | `Repartidor123!` |
| 🛒 **cliente** | Santiago Ramírez | `cliente@fhs.com` | `Cliente123!` |

- **Endpoints de Autenticación:**
  - `POST /api/auth/register` (Registro con validación OWASP)
  - `POST /api/auth/login` (Inicio de sesión con JWT)
  - `GET /api/auth/me` (Perfil del usuario autenticado)
  - `PATCH /api/auth/profile` (Actualización de perfil y cambio de clave)
  - `GET /api/auth/users` (Listado de usuarios - Solo Admin)
  - `PATCH /api/auth/users/:id/role` (Cambiar rol - Solo Admin)
  - `DELETE /api/auth/users/:id` (Eliminar usuario - Solo Admin)
- **Dashboard Web de Control:** Abre `http://localhost:4000` en tu navegador para ver usuarios por rol, métricas en vivo y probar endpoints.

### Iniciar el servidor:
```bash
# Desde la raíz:
npm run start:servidor

# O dentro de la carpeta servidor:
cd servidor
npm start
```

---

## 🛒 2. Aplicación del Cliente (`/cliente`)

Aplicación móvil para el usuario final con experiencia completa de compra y mensajería express:
- **Explorador de Tiendas y Comercios Aliados:** Filtro por categorías (Restaurantes, Supermercados, Farmacias, FHS Turbo 10m, Licores), buscador en tiempo real y badges de convenios (Diamante, Oro, Bonos).
- **Catálogo de Productos por Tienda:** Menú completo con fotos/emojis, descripciones, precios en pesos colombianos y controles de cantidad (+/-).
- **🛵 Pedir Servicio de Domicilio Express (Mandados):** Formulario para solicitar envíos directos (recogida y entrega de llaves, paquetes, compras urgentes), selección de tamaño, propina sugerida y método de pago (Tarjeta o Efectivo).
- **Canasta de Compra y Checkout:** Desglose financiero (subtotal, tarifa de envío, propina al repartidor, total), selección de dirección y notas para el domiciliario ("Apto 502, timbrar al citófono").
- **Rastreo en Tiempo Real:** Seguimiento paso a paso del pedido (Buscando repartidor ➡️ Rumbo a tienda ➡️ En tienda ➡️ En camino ➡️ Entregado), ficha del domiciliario asignado (nombre, vehículo, calificación, batería) y **PIN de seguridad de entrega**.
- **Sincronización:** Botón e indicador de conexión con el Servidor Central (Puerto 4000).

### Iniciar el Cliente:
```bash
# Desde la raíz:
npm run web:cliente
# o
npm run start:cliente

# O dentro de la carpeta cliente:
cd cliente
npm run web      # Navegador
npm run ios      # Simulador iOS
npm run android  # Emulador Android
```

---

## 🛵 3. Aplicación del Repartidor (`/repartidor`)

Aplicación móvil para el mensajero con:
- Mapa interactivo de radar con comercios aliados (**Convenios Diamante, Oro, Plata**) y bonificaciones.
- Ubicación de compañeros en vivo con indicador de vehículo (🏍️ Moto, 🚲 Bici), estado, batería e intercomunicador.
- **Pines de Entrega con Estrellita (⭐):** Al completar una entrega, el domiciliario puede calificar la dirección con una estrellita y dejar notas y tips (ej. *"Don Pedro en portería recibe", "Ascensor izquierdo más rápido", "Parqueadero de motos techado"*) para que los futuros domiciliarios ubiquen el punto en el mapa al instante.
- Notificación de nuevo pedido con cuenta regresiva de 30 segundos.
- HUD de navegación de 3 pasos (Rumbo al comercio -> Checklist de productos -> Entrega al cliente con validación por PIN).
- Canal de radio comunitaria, historial de entregas y retiros inmediatos a Nequi.

### Iniciar el Repartidor:
```bash
# Desde la raíz:
npm run web:repartidor
# o
npm run start:repartidor

# O dentro de la carpeta repartidor:
cd repartidor
npm run web      # Navegador
npm run ios      # Simulador iOS
npm run android  # Emulador Android
```

---

## 👔 4. Aplicación del Administrador (`/administrador`)

Torre de control para gerentes y despachadores:
- **KPIs en Vivo:** Total de repartidores activos, disponibles vs en ruta, pedidos en curso y facturación.
- **Mapa Satelital de Flota:** Monitoreo de todos los trabajadores en la ciudad, comercios y trazado de rutas activas.
- **Gestión de Tiendas y Catálogos:** Pestaña dedicada para crear comercios, editar nombres, direcciones, categorías, tiers y coordenadas geográficas, además de agregar, editar o eliminar productos del catálogo de cada tienda.
- **Visualizador de Ubicaciones Recientes y Pines ⭐:** Pestaña para inspeccionar todas las direcciones marcadas con estrellitas y tips dejados por los domiciliarios.
- **Torre de Despacho:** Supervisión y **reasignación manual** de pedidos a couriers disponibles.
- **Aviso Masivo (Broadcast):** Envío de comunicados prioritarios a todos los repartidores.

### Iniciar el Administrador:
```bash
# Desde la raíz:
npm run web:administrador
# o
npm run start:administrador

# O dentro de la carpeta administrador:
cd administrador
npm run web      # Navegador
npm run ios      # Simulador iOS
npm run android  # Emulador Android
```

---

## 🧪 5. Aplicación de Pruebas / Sandbox (`/prueba`)

Entorno de pruebas y simulación para generar datos en vivo:
- **Creador de Tiendas con Convenio:** Registra nuevos comercios en el mapa con categoría, nivel de convenio, bonos y coordenadas. ¡Se reflejan de inmediato en el servidor, en el cliente y en el admin!
- **Creador de Repartidores de Prueba:** Despliega nuevos trabajadores con vehículo (moto, bici, auto), estado inicial y batería.
- **Despachador de Pedidos de Prueba:** Genera pedidos personalizados y dispáralos directamente a la app del repartidor para probar el flujo de aceptación.
- **Simuladores en Vivo:**
  - ⚡ *Simular Movimiento GPS*: Mueve la posición de toda la flota en el mapa.
  - 🌧️ *Alerta de Clima*: Envía reporte de lluvia a la radio.
  - 🚨 *Alerta de Tránsito*: Alerta de control vial.
  - 🔄 *Restablecer Datos*: Vuelve a los valores demo originales.

### Iniciar la App de Pruebas:
```bash
# Desde la raíz:
npm run web:prueba
# o
npm run start:prueba

# O dentro de la carpeta prueba:
cd prueba
npm run web      # Navegador
npm run ios      # Simulador iOS
npm run android  # Emulador Android
```

---

## 🌐 Conexión en Red Local o Internet

Cada aplicación React Native incluye un indicador y selector de conexión en la parte superior donde se conecta automáticamente al servidor central en `http://localhost:4000` (o `http://10.0.2.2:4000` en emuladores Android). También permite ingresar una IP local o dominio en la nube (ejemplo: `http://192.168.1.45:4000` o `https://tu-servidor-fhs.com`).
