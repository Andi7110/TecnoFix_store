# Despliegue de TecnoFix en Hostinger

Esta guia usa dos subdominios del mismo dominio principal:

- `app.example.com`: frontend React.
- `api.example.com`: backend Laravel.

Reemplaza `example.com` por tu dominio real. React y Laravel deben compartir el
mismo dominio principal para que la autenticacion SPA de Sanctum funcione con
cookies de sesion.

## 1. Preparar Hostinger

1. Activa SSL/HTTPS para ambos subdominios.
2. Selecciona PHP 8.3 o superior para el backend.
3. Crea una base MySQL y guarda host, nombre, usuario y contrasena.
4. Configura el document root de `api.example.com` para que apunte a
   `backend/public`. Nunca expongas la raiz completa de `backend`.
5. Configura el document root de `app.example.com` para la carpeta donde se
   publicara el contenido generado de `frontend/dist`.

## 2. Configurar y publicar Laravel

En el servidor, dentro de `backend`:

```bash
composer install --no-dev --prefer-dist --optimize-autoloader
cp .env.production.example .env
php artisan key:generate --force
```

Antes de continuar, edita `.env` y reemplaza todos los valores `example.com` y
`REEMPLAZAR_*`. Conserva estas opciones en produccion:

```dotenv
APP_ENV=production
APP_DEBUG=false
SESSION_SECURE_COOKIE=true
```

Luego ejecuta:

```bash
php artisan migrate --force
php artisan app:create-admin
php artisan storage:link
php artisan optimize
```

`app:create-admin` solicita la contrasena de forma oculta y crea el primer
administrador sin guardar credenciales predeterminadas en el repositorio. La
contrasena debe tener al menos 12 caracteres, mayusculas, minusculas, numeros y
simbolos. Ejecuta este comando solo para el alta inicial; los usuarios
posteriores se administran desde el sistema.

Las carpetas `backend/storage` y `backend/bootstrap/cache` deben tener permiso
de escritura para el usuario que ejecuta PHP. No uses permisos `777`.

## 3. Configurar y publicar React

En tu equipo o en un entorno con Node.js, dentro de `frontend`:

```bash
cp .env.production.example .env.production
npm ci
npm run lint
npm run build
```

Edita `.env.production` con el dominio real antes de compilar. Las variables
`VITE_*` quedan incluidas en los archivos generados; cambiar el archivo despues
del build no modifica el frontend.

Sube el contenido de `frontend/dist` al document root de `app.example.com`.
Configura el servidor para que las rutas que no correspondan a archivos reales
devuelvan `index.html`, porque React maneja las rutas del navegador.

## 4. Verificacion final

1. Abre `https://api.example.com/up`; debe responder correctamente.
2. Abre `https://api.example.com/sanctum/csrf-cookie`; debe responder `204`.
3. Inicia sesion desde `https://app.example.com`.
4. Confirma en el navegador que las peticiones a `/api` no tengan errores de
   CORS, CSRF ni cookies bloqueadas.
5. Revisa `backend/storage/logs` si el servidor devuelve un error `500`.

## 5. Actualizaciones posteriores

Para cada nueva version:

```bash
composer install --no-dev --prefer-dist --optimize-autoloader
php artisan migrate --force
php artisan optimize
```

Vuelve a ejecutar `npm ci && npm run build` cuando cambie el frontend o alguna
variable `VITE_*`.
