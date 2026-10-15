# Three Star

## Puesta en marcha
1. `npm install`
2. `cp .env.example .env` y completa `DATABASE_URL` y `MP_ACCESS_TOKEN`
3. Crea la BD en MySQL: `CREATE DATABASE three_star;`
4. Migraciones: `npx prisma migrate dev --name init`
5. Sembrar productos: `npm run seed`
6. `npm run dev` → http://localhost:3000

## Webhook en local
Mercado Pago necesita una URL pública: `ngrok http 3000` y pon esa URL en `NEXT_PUBLIC_BASE_URL`.

## Producción
`npx prisma migrate deploy` y `npm run build && npm start`.
