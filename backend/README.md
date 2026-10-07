# TecnoFix backend

API Laravel del sistema TecnoFix. La interfaz React se mantiene por separado en
`../frontend`; este proyecto no compila recursos web propios.

## Desarrollo local

```bash
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
composer dev
```

Ejecuta el frontend desde su propia carpeta con `npm run dev`.

## Pruebas

MySQL es la base de referencia. El esquema utiliza `ENUM` y `FULLTEXT`, por lo
que la suite no debe ejecutarse con SQLite.

1. Inicia MySQL local.
2. Configura host, puerto, usuario y contrasena en `.env`.
3. Ejecuta `composer test`.

El runner crea una base temporal con prefijo `tecnofix_test_`, ejecuta
migraciones y seeders, comprueba una actualización sobre un esquema existente,
corre toda la suite y elimina la base temporal. Nunca lo apuntes a una base con
datos reales.

## Produccion

Consulta [`../DEPLOY_HOSTINGER.md`](../DEPLOY_HOSTINGER.md). El document root
del servidor debe apuntar a `backend/public`.
