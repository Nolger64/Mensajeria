# Aura Spa

Aplicación de una cadena de spas para comprar productos de sus sedes y reservar citas de spa. El portal de Expo abre la interfaz correspondiente al rol de la cuenta.

## Roles

| Rol | Acceso |
| --- | --- |
| Cliente | Crea su cuenta desde el portal. Compra productos de una sede, sigue sus pedidos y reserva, consulta, reprograma o cancela sus propias citas antes de la hora de inicio. |
| Especialista | Consulta las citas que tiene asignadas y registra si atendió al cliente o si este no asistió, desde el inicio de la cita. |
| Administración | Gestiona las sedes, el catálogo, los tratamientos y las sesiones. Crea, edita y elimina especialistas y repartidores. Consulta todas las citas, cancela las próximas o registra el resultado cuando corresponde. Asigna pedidos al equipo de reparto. |
| Repartidor | Activa su disponibilidad, consulta las entregas asignadas y confirma la entrega con el PIN del cliente. La agenda está fuera de su acceso. |

## Ejecutar Aura Spa con Supabase

Expo consume la Edge Function `aura-api`. La función conserva las rutas de tienda, reparto y citas. Supabase Auth guarda y verifica las credenciales. La función usa la sesión de Aura Spa y comprueba el rol actual en cada solicitud protegida.

1. Desde la raíz, ejecuta `npm start`. Por defecto, Expo se conecta a la función desplegada en el proyecto Supabase de Aura Spa.
2. Para apuntar a otro entorno, define `EXPO_PUBLIC_API_URL` en el `.env.local` de Expo con `https://TU_PROJECT_REF.supabase.co/functions/v1/aura-api`. Usa la misma variable en el entorno con el que generes el APK.
3. Para usar la versión conectada a Supabase en Android, genera e instala un APK nuevo con el código actualizado.

PostgreSQL guarda la operación y la agenda en el esquema privado `aura_private`. Cada escritura se valida con el estado recién leído bajo un bloqueo de transacción. Esto evita que dos solicitudes ocupen al mismo tiempo el mismo horario. Las contraseñas y las claves del servidor se gestionan en Supabase. El APK recibe la URL pública.

Para replicar el despliegue en otro proyecto, aplica los archivos de `supabase/migrations` y despliega `supabase/functions/aura-api` con la configuración de `supabase/config.toml`. Crea la primera cuenta desde el portal y promueve su perfil a administrador con una operación privilegiada de base de datos. Comprueba primero que el ID corresponda a la cuenta elegida y que el proyecto aún no tenga un administrador. Las demás cuentas de equipo se gestionan desde la interfaz de administración.

En el proyecto de pruebas, las credenciales generadas para las cuatro cuentas se encuentran en `servidor/.env.supabase-prueba.local`, excluido de Git. `node servidor/verificar-supabase.js` verifica los cuatro roles, el CRUD de personal, la reserva simultánea, la reprogramación y la entrega de un pedido con PIN. El comando genera datos de prueba y debe apuntar al proyecto de pruebas.

## Inicio local con SQLite

Usa Node.js 22.13 o superior para el servidor y una versión de Node compatible con Expo SDK 57 para el cliente. Instala las dependencias desde la raíz.

```bash
npm install
```

Copia `servidor/.env.example` a `servidor/.env.local` y completa la configuración privada. Define juntas las tres variables `FHS_ADMIN_*` para crear la primera cuenta administradora. El servidor conserva esa cuenta en reinicios posteriores. Si reutilizas un entorno que usaba credenciales integradas, elige valores nuevos.

| Variable | Uso |
| --- | --- |
| `JWT_SECRET` | Clave aleatoria privada de al menos 32 caracteres para firmar las sesiones. |
| `FHS_ADMIN_NAME`, `FHS_ADMIN_EMAIL`, `FHS_ADMIN_PASSWORD` | Datos para crear la primera cuenta administradora. La contraseña requiere ocho caracteres como mínimo, con mayúscula, minúscula, número y símbolo. |
| `PORT` | Puerto de la API. Valor predeterminado `4000`. |
| `JWT_EXPIRES_IN` | Duración de la sesión. Valor predeterminado `24h`. |
| `FHS_DATABASE_PATH` | Ruta de la base SQLite. Valor predeterminado `servidor/data/aura.sqlite`. |

Desde la raíz, inicia la API y el portal en terminales separadas.

```bash
npm run start:servidor
npm start
```

Para usar la API local, define `EXPO_PUBLIC_API_URL` en el `.env.local` del proyecto Expo. Usa `http://localhost:4000` en web y en el simulador iOS, `http://10.0.2.2:4000` en el emulador Android o la dirección IP de tu computador en un teléfono conectado a la misma red. Las variables `EXPO_PUBLIC_*` quedan visibles en el paquete de la app. Guarda las claves y contraseñas en el entorno privado del servidor. [Variables de entorno en Expo](https://docs.expo.dev/guides/environment-variables/)

También puedes abrir las ediciones individuales con `npm run start:cliente`, `npm run start:administrador` y `npm run start:repartidor`. En ese caso configura la URL pública en el `.env.local` de la carpeta correspondiente. El especialista entra por el portal principal.

## Puesta en marcha de una sede

1. En **Catálogo**, crea una sede de Aura Spa y registra sus productos disponibles.
2. En **Agenda → Equipo** puedes agregar, editar o eliminar especialistas y repartidores. Los repartidores también se encuentran desde **Reparto → Gestionar repartidores**. Antes de eliminar una cuenta, resuelve sus citas activas o entregas en curso. Los pedidos ofrecidos y aún sin aceptar regresan a la cola de pendientes.
3. En **Agenda → Horarios → Nuevo horario**, define la sede, la fecha de inicio, la fecha final y las horas diarias de trabajo en Bogotá. Elige los especialistas y los tratamientos que atenderán. Cuando el catálogo esté vacío, el horario se publica para **Consulta general**.
4. El sistema divide cada tramo disponible en citas consecutivas según la duración del tratamiento elegido. De 8:00 a 12:00 caben cuatro citas de 60 minutos o dos de 90 minutos por especialista. La **Consulta general** dura 30 minutos y su precio se consulta en la sede.
5. Solo se muestran citas completas que caben en el horario del mismo especialista y quedan libres de reservas. Si el horario elegido para reprogramar ya está ocupado, se conserva la cita original.

El servidor controla los cruces de horarios del especialista entre sedes y los cruces del cliente entre citas. Cancelar una cita futura vuelve a liberar el horario. Las citas se pagan en la sede y los pedidos de la tienda se pagan en efectivo contraentrega.

## Datos y pruebas

En modo local, SQLite conserva cuentas, sedes, productos, pedidos y agenda al reiniciar. Ejecuta una sola instancia de la API por archivo de base de datos. Los datos reales se cargan desde administración.

### Agenda de prueba local

Ejecuta `npm run agenda:prueba` desde la raíz para iniciar la API de prueba en el puerto 4100 y abrir el portal Expo en `http://localhost:8094`. Para preparar la base sin iniciar el portal, usa `npm run agenda:prueba -- --solo-datos`.

El comando usa `servidor/data/agenda-prueba.sqlite`, una sede de demostración y cuatro cuentas autenticadas de administrador, repartidor, cliente y especialista. Publica horarios de 8:00 a 12:00 y de 14:00 a 18:00 para los próximos dos días en Bogotá, con Consulta general y tratamientos de 60 y 90 minutos. Puedes reiniciar el portal sin duplicar esos horarios.

La configuración local se lee de `servidor/.env.agenda-prueba.local`, excluido de Git. Para recrearla en otra máquina, define las parejas `FHS_PRUEBA_<ROL>_EMAIL` y `FHS_PRUEBA_<ROL>_PASSWORD` para `ADMIN`, `REPARTIDOR`, `CLIENTE` y `ESPECIALISTA`, y una clave independiente `FHS_PRUEBA_JWT_SECRET` de al menos 32 caracteres.

Para practicar con datos ficticios, ejecuta `npm run web:prueba` contra un servidor separado con `FHS_SANDBOX=true`, su propia clave y otro puerto. Este modo escucha en la interfaz local, usa una base en memoria y habilita el laboratorio de entregas de Aura Spa. En producción, el laboratorio permanece deshabilitado. El apartado de citas siempre exige una sesión del rol correspondiente.

```bash
npx expo lint
npx tsc --noEmit
node --test servidor/spa.test.js
```
