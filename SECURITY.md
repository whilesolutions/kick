# SECURITY & PRIVACY POLICY — Kicks Selector

Este documento define la arquitectura de seguridad, la gestión de secretos y las políticas de acceso para la aplicación **Kicks Selector** (destino de links de Meta Ads para Kicks Venezuela).

---

## 1. Principio de Cero Secretos en el Frontend

* **Cero llaves en cliente:** Ninguna credencial privada (Firebase Admin Service Account, Shopify Admin Token, Contraseñas) se expone al cliente React o al bundle de JavaScript.
* **Storefront vs Admin Token en Shopify:**
  * La aplicación utiliza **exclusivamente** el `SHOPIFY_STOREFRONT_TOKEN` (permiso de solo lectura sobre productos públicos).
  * **NUNCA** se debe configurar un `SHOPIFY_ADMIN_TOKEN` en este repositorio. Si en el futuro se requiere sincronizar inventario avanzado o pedidos, debe gestionarse en un backend independiente desacoplado.
* **Firebase:** Las credenciales de Firestore residen exclusivamente en variables de entorno del servidor Node.js (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).

---

## 2. Protección del Servidor Express

* **Helmet habilitado:** Configuración de cabeceras de seguridad HTTP (`X-Content-Type-Options: nosniff`, `X-Frame-Options`, `Referrer-Policy: strict-origin-when-cross-origin`).
* **Supresión de Huellas:** `app.disable('x-powered-by')` activo para evitar divulgación del framework subyacente.
* **Límite de Carga (Payload Limiting):** Parsers de JSON y URL-Encoded restringidos a `100kb` para mitigar ataques DoS por inyección de payloads masivos.
* **Rate Limiting:**
  * `GET /api/public/campaign/:id` y `GET /api/public/products`: Máximo 60 peticiones/minuto por IP.
  * `POST /api/public/track`: Máximo 120 eventos/minuto por IP.

---

## 3. Validación y Sanitización Estricta de Entradas

* **IDs de Campaña:** Validación obligatoria mediante expresión regular `^[a-z0-9_-]{1,32}$`. Rechazo con HTTP 400 si contiene caracteres extraños o longitud superior a 32 caracteres.
* **Parámetros de Producto:** Sanitización de `vendor`, `category` y `tag` con límite de 50 caracteres y verificación contra whitelist.
* **Tracking de Eventos:** Validación estricta de tipos (`session_id`, `event`, strings acotados) para evitar polución o manipulación de la base de datos Firestore.

---

## 4. Checklist de Endpoints: Públicos vs Privados

| Endpoint | Método | Acceso | Control de Seguridad |
| :--- | :--- | :--- | :--- |
| `/api/public/campaign/:id` | `GET` | Público | Regex `[a-z0-9_-]{1,32}`, Rate Limit (60/min), Cache 60s |
| `/api/public/products` | `GET` | Público | Whitelist & Sanitización, Rate Limit (60/min), Cache 5-10m |
| `/api/public/track` | `POST` | Público | Schema Validation, Rate Limit (120/min), Keepalive/Beacon |
| `/api/public/admin/funnel-metrics` | `GET` | **Protegido** | Header `x-admin-password` con `ADMIN_FUNNEL_PASSWORD` |
| `/admin/funnel` | `UI` | **Protegido** | Formulario con contraseña de acceso |

---

## 5. Advertencia Crítica de Despliegue en Producción

> ⚠️ **IMPORTANTE: Entorno de Producción**
>
> Para operar en producción con tráfico masivo de Meta Ads y ventas reales:
> 1. Desplegar el contenedor o servicio en **Google Cloud Run** o **Firebase Hosting + Cloud Functions**.
> 2. No exponer secretos en entornos de prueba públicos.
> 3. En caso de habilitar capacidades con Gemini SDK (`@google/genai`), utilizar una API Key con restricción de IP/servicio en Google Cloud Console, independiente y con cuota acotada.

---

## 6. Privacidad y Cumplimiento

* **Sin rastreo biométrico ni grabaciones de video:** Esta aplicación NO incluye session replays con video (ni FullStory, ni Hotjar).
* **Identificadores anónimos:** La sesión del usuario se genera mediante un hash aleatorio efímero almacenado en `sessionStorage`, que se destruye al cerrar la pestaña del navegador.
