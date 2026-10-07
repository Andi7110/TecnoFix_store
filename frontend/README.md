# TecnoFix frontend

SPA React/Vite del sistema TecnoFix.

## Desarrollo local

```bash
npm ci
copy .env.example .env.local
npm run dev
```

Las variables `VITE_DEV_*` controlan exclusivamente el servidor local y su
proxy hacia Laravel. No agregues dominios temporales al repositorio.

## Validacion

```bash
npm run lint
npm run build
```

## Produccion

Copia `.env.production.example` como `.env.production`, reemplaza los dominios
y ejecuta `npm run build`. Las variables `VITE_*` quedan integradas en el
JavaScript generado, por lo que cualquier cambio requiere compilar nuevamente.

Consulta [`../DEPLOY_HOSTINGER.md`](../DEPLOY_HOSTINGER.md) para el despliegue
completo.
