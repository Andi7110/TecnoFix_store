# TecnoFix frontend

## Environment modes

- **Local development:** copy `.env.example` to `.env.local`. The documented
  defaults use `127.0.0.1` for Vite and Laravel.
- **Temporary test tunnel:** keep its values in `.env.local` (never commit that
  file). Set `VITE_DEV_HOST`, add the exact tunnel hostname to
  `VITE_DEV_ALLOWED_HOSTS`, and set `VITE_DEV_PROXY_ORIGIN` when Laravel must
  receive the local frontend origin. `/api` and `/sanctum` are proxied to
  `VITE_DEV_PROXY_TARGET`.
- **Production:** set `VITE_BACKEND_URL` and `VITE_API_URL` in the deployment
  environment. If they are omitted on a non-local host, Axios uses the browser's
  current origin. Development-server tunnel settings are not production
  defaults.

Do not add temporary tunnel domains to tracked files.

## Vite notes

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
