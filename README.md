# bacan

bacan es un editor open source inspirado en Canva. El primer objetivo es tener un canvas central, subir imagenes y empezar a manipularlas como capas.

## Stack

- Vite + React + TypeScript
- Bun
- Tailwind CSS v4
- shadcn/ui
- Convex
- Clerk con Google y GitHub
- React Konva / Konva para el motor de canvas

## Funcionalidades basicas tipo Canva

- Subir imagenes y organizarlas como capas.
- Mover, escalar, rotar y ajustar opacidad.
- Recortar imagenes y aplicar mascaras.
- Agregar texto editable con fuentes y estilos.
- Formas basicas, lineas, iconos y stickers.
- Plantillas con tamanos para redes sociales.
- Alinear, distribuir, agrupar y bloquear capas.
- Historial de deshacer/rehacer.
- Filtros de brillo, contraste, saturacion y blur.
- Exportar PNG/JPG/PDF.
- Guardar proyectos y versiones.
- Colaboracion en tiempo real con Convex.
- Biblioteca de assets reutilizables.

## Estado actual

El MVP inicial incluye:

- Canvas blanco cuadrado de 4096 x 4096.
- Upload local de imagenes.
- Capas seleccionables y arrastrables.
- Resize y rotacion con handles.
- Inspector para nombre, posicion, rotacion y opacidad.
- Duplicar, eliminar y exportar PNG.
- Boilerplate de Convex con tabla `projects`.

## Desarrollo

```bash
bun install
bun run dev
```

### Autenticación y Convex

El acceso a todas las páginas requiere una sesión de Clerk. Los proyectos,
assets, comentarios, versiones, enlaces y presencia se autorizan en Convex con
el propietario derivado del token; el frontend nunca envía un `userId` para
decidir permisos.

Para enlazar otra instalación con sus propias apps de Clerk y Convex:

```bash
cp .env.example .env.local
clerk auth login
clerk link --app app_xxx
clerk env pull
bunx convex dev
```

Configura `VITE_CONVEX_URL` y `VITE_CLERK_PUBLISHABLE_KEY` en `.env.local`.
En Clerk activa Google, GitHub y la plantilla JWT `convex`. En el deployment de
Convex configura el issuer de la instancia Clerk:

```bash
bunx convex env set CLERK_JWT_ISSUER_DOMAIN https://your-instance.clerk.accounts.dev
```

`CLERK_SECRET_KEY` no debe usarse en código cliente ni subirse al repositorio.

## Scripts

```bash
bun run dev
bun run build
bun run lint
bun run test
bun run convex:dev
```

No hay despliegue configurado todavia.
