# Guía de Deploy — Florence at Night en Hostinger

> **Convención usada en esta guía**
> - 💻 **EN TU PC** — pasos que hacés en tu computadora
> - 🌐 **EN HOSTINGER (hPanel)** — pasos que hacés en `panel.hostinger.com`

---

## Cómo funciona el flujo con GitHub

En lugar de subir archivos manualmente, el código vive en un repositorio de GitHub. Hostinger se conecta a ese repo, baja el código, corre `npm run build` y arranca el servidor. Cuando necesitás actualizar la web, solo hacés `git push` y después le das **Pull** en Hostinger.

```
Tu PC  →  git push  →  GitHub  →  Hostinger (pull + build + restart)
```

El contenido dinámico (imágenes/videos subidos desde el admin, nombre del artista) vive directamente en el servidor de Hostinger y **nunca pasa por git**.

---

## PARTE 1 — Configuración inicial (se hace una sola vez)

### 💻 Paso 1 — Crear el repositorio en GitHub

1. Entrá a [github.com](https://github.com) → **New repository**
2. Ponele un nombre (ej: `florence-at-night`)
3. Dejalo en **Private** (el `.env` no va a subir, pero igual es mejor privado)
4. No inicialices con README ni nada — lo vamos a hacer desde la terminal

---

### 💻 Paso 2 — Verificar el .gitignore

En la raíz del proyecto ya existe un `.gitignore` configurado. Confirmá que está este contenido:

```
node_modules/
dist/
.env
.env.local
uploads/
data/texts.json
```

Esto asegura que nunca se suban al repo:
- `node_modules/` — pesa cientos de MB, se instala en el servidor
- `dist/` — se genera con `npm run build` en el servidor
- `.env` — contiene las credenciales del admin
- `uploads/` — imágenes/videos subidos por el equipo de marketing desde el panel
- `data/texts.json` — nombre del artista y otros textos editables

> **Nota:** El servidor crea las carpetas `uploads/` y `data/` automáticamente al iniciarse, así que no hace falta subirlas.

---

### 💻 Paso 3 — Subir el código a GitHub

Abrí una terminal en la carpeta del proyecto:

```bash
git init
git add .
git commit -m "primer commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

Reemplazá `TU_USUARIO/TU_REPO` con la URL real de tu repositorio (la encontrás en GitHub → botón verde **Code**).

Verificá en GitHub que se subieron los archivos y que **no aparece** ni `.env`, ni `dist/`, ni `uploads/`, ni `node_modules/`.

---

### 🌐 Paso 4 — Conectar Hostinger con GitHub

1. En hPanel → **Avanzado → Git**
2. Autorizá el acceso a GitHub si te lo pide
3. Seleccioná tu repositorio `florence-at-night` y la rama `main`
4. En el campo **Application path** (o "Ruta de la aplicación"), ponés la carpeta raíz de tu dominio (generalmente `public_html` o el nombre de tu dominio)
5. Guardá

---

### 🌐 Paso 5 — Crear la aplicación Node.js

1. hPanel → **Avanzado → Node.js** → **Create Application**
2. Completá los campos:

   | Campo | Qué poner |
   |-------|-----------|
   | **Node.js version** | La más reciente disponible (18.x o 20.x) |
   | **Application mode** | Production |
   | **Application root** | La misma ruta que pusiste en el Paso 4 |
   | **Application startup file** | `server.js` |

3. Guardá la configuración (todavía no la iniciás).

---

### 🌐 Paso 6 — Configurar las variables de entorno

Estas variables reemplazan al archivo `.env` que no sube a GitHub.

En la sección Node.js de tu app, buscá **Environment Variables** (o "Variables de entorno") y agregá:

| Variable | Valor |
|----------|-------|
| `ADMIN_USER` | `admin` (o el usuario que quieras) |
| `ADMIN_PASS` | Una contraseña segura |
| `SESSION_SECRET` | Una cadena larga y aleatoria (mínimo 32 caracteres, ej: `florenceatnight2024supersecretkey`) |

> El `PORT` no hace falta agregarlo — Hostinger lo asigna automáticamente.

---

### 🌐 Paso 7 — Primer deploy: bajar el código y compilar

1. En hPanel → Git → tu repositorio → **Pull** (baja el código de GitHub al servidor)
2. En hPanel → Node.js → tu app → **Run NPM Install** (instala Express, Multer, etc.)
3. En la misma sección, buscá un campo de **build command** o **npm script** y configurá: `npm run build`
   - Si no hay ese campo, podés conectarte por SSH y correr `npm run build` manualmente (ver nota abajo)
4. Una vez compilado, hacé clic en **Start** (o **Restart**)

> **Si Hostinger no tiene campo de build command:** conectate por SSH (hPanel → Avanzado → Acceso SSH) y corré `cd public_html && npm run build`. Solo necesitás hacerlo en este primer deploy y cada vez que actualicés el código.

---

### 🌐 Paso 8 — Verificar que todo funciona

1. Abrí `https://tudominio.com` → tiene que cargar la web de Florence at Night
2. Abrí `https://tudominio.com/admin` → tiene que aparecer el login del panel
3. Ingresá con las credenciales que configuraste en el Paso 6
4. Subí una imagen de prueba y verificá que aparece en la web

Si algo falla, revisá los logs: hPanel → Avanzado → Node.js → **Logs**.

---

## PARTE 2 — Actualizar el código (el flujo del día a día)

Cada vez que hagas cambios en el código (HTML, CSS, JS, lógica del servidor):

### 💻 En tu PC

```bash
git add .
git commit -m "descripción del cambio"
git push
```

### 🌐 En Hostinger

1. hPanel → **Avanzado → Git** → **Pull**
2. Si cambiaste archivos del frontend (HTML, CSS, JS, imágenes en `public/`): corré `npm run build` (SSH o build command si está configurado)
3. hPanel → **Node.js** → **Restart**

> Si solo cambiaste `server.js` o algún archivo de backend que no requiere build, podés saltarte el paso de build y solo reiniciar.

---

## PARTE 3 — Actualizar contenido (sin tocar código)

El equipo de marketing puede ir a `tudominio.com/admin` y actualizar directamente:

- **Imagen principal** del Main Event
- **Flyers de booking** por día (Lun → Sáb)
- **Videos de la agenda semanal** (Lun → Sáb)
- **Nombre del artista/DJ**

No necesitan acceso a Hostinger ni conocimientos técnicos. Este contenido se guarda directamente en el servidor y **no pasa por git**.

**Tamaños recomendados:**
- Imagen principal (Main Event): 800 × 800 px
- Flyers booking: 1080 × 1920 px o 1168 × 2048 px (vertical)
- Videos semanales: 1080 × 1920 px, formato MP4, máximo 50 MB

---

## Solución de problemas comunes

| Síntoma | Qué revisar |
|---------|-------------|
| Pantalla en blanco o "Application Error" | Ver logs en hPanel → Node.js → Logs. Verificar que `npm install` terminó sin errores. |
| Error 502 Bad Gateway | La app Node.js crasheó. Ver logs y hacer Restart. |
| Los cambios de código no se ven | Verificar que hiciste Pull en Hostinger, corriste `npm run build` y reiniciaste la app. |
| Las imágenes subidas desde el admin no aparecen | Verificar que `uploads/` tiene permisos de escritura (755). Limpiar caché con `Ctrl+Shift+R`. |
| No puedo acceder a `/admin` | Verificar que la carpeta `admin/` con `index.html` está en el repo y se descargó con el Pull. |
| Login del admin no funciona | Verificar las variables de entorno `ADMIN_USER` y `ADMIN_PASS` en la sección Node.js. Reiniciar la app después de cambiarlas. |
| `npm run build` falla en el servidor | Conectarse por SSH y correr el comando manualmente para ver el error completo. |
