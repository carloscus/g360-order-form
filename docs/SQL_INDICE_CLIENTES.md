# SQL — Índices para búsqueda de clientes sin statement timeout

> **Problema**: la búsqueda de clientes contra `public.ventas` (482.791 filas) con
> `%contains%`, prefijos `ilike 'term*'` o `eq` sobre `id_cliente`/`doc_cliente`
> hace **full-scan** (no hay índice de texto) y choca con el `statement_timeout`
> de Supabase (~3 s) → PostgREST responde `500 { code: "57014" }`.
>
> **Estado: MIGRACIÓN NO APLICADA** (verificado 2026-10-15 con la anon key).
>
> | Query (PostgREST) | Resultado | Tiempo |
> |---|---|---|
> | `nom_cliente=ilike.ZZZQX*` (sin match) | **500 / 57014** | 3.5–3.7 s (3/3) |
> | `nom_cliente=ilike.MERCI*` (con match) | **500 / 57014** (bajo carga) | 3.5 s |
> | `nom_cliente=ilike.MER*` (con match) | 200 | 1.9 s (al límite) |
> | `nom_cliente=ilike.*MERC*` (contains) | 200 (encuentra filas y corta) | 0.4 s |
> | `id_cliente=eq.00023307` | 200 (full-scan `=` barato) | 0.65 s |
> | `doc_cliente=eq.20508565934` | 200 (full-scan `=` barato) | 0.4 s |
>
> Conclusión: **todas** las estrategias son seq-scans; las ILIKE quedan al borde
> de los 3 s y fallan intermitentemente según la carga de la BD compartida.
> Sin índices, ninguna corrección del frontend elimina los 500.
>
> **Dónde ejecutar**: Supabase → proyecto `g360-ventas-db` → **SQL Editor** → Run.
> Requiere rol con permisos DDL (owner del proyecto, no la anon key).
>
> **Estado del frontend**: `clientesService.js` ya es timeout-safe (estrategia
> código exacto → RUC completo → prefijo de nombre + 1 reintento). Con estos
> índices, además, la búsqueda por nombre parcial (`contains`) vuelve a ser viable.

## Migración

```sql
-- 1) Extensión trigram (necesaria para índices GIN sobre texto)
create extension if not exists pg_trgm;

-- 2) Índice GIN trigram sobre el nombre: acelera
--    nom_cliente ilike '%term%'  (contains) e  ilike 'term*'  (prefijo)
create index if not exists idx_ventas_nom_cliente_trgm
  on public.ventas using gin (nom_cliente gin_trgm_ops);

-- 3) B-tree sobre el RUC/DNI del cliente: acelera doc_cliente = eq y prefijo
create index if not exists idx_ventas_doc_cliente
  on public.ventas (doc_cliente);

-- 4) B-tree sobre el código del cliente: acelera id_cliente = eq
--    (estrategia 1 de la app; hoy es full-scan ~0.65 s)
create index if not exists idx_ventas_id_cliente
  on public.ventas (id_cliente);
```

## Verificación post-migración

```sql
explain analyze
select id_cliente, doc_cliente, nom_cliente
from public.ventas
where nom_cliente ilike '%ferreteria%'
limit 10;
-- Esperado: "Bitmap Index Scan on idx_ventas_nom_cliente_trgm", < 100 ms

explain analyze
select id_cliente from public.ventas where nom_cliente ilike 'ZZZQX%' limit 10;
-- Esperado: también por índice (0 filas, < 10 ms) — hoy este caso da 500/57014
```

Vía REST, repetir la verificación:

```text
GET /rest/v1/ventas?select=id_cliente&nom_cliente=ilike.MERCI*&limit=10
→ 200 en < 200 ms (hoy: intermitentemente 500 / 57014)
```

## Rollback

```sql
drop index if exists public.idx_ventas_nom_cliente_trgm;
drop index if exists public.idx_ventas_doc_cliente;
-- (la extensión pg_trgm se puede dejar instalada)
```

## Notas

- Costo: los índices ocupan espacio y bajan el throughput de INSERT en `ventas`
  (la carga del ERP es batch, no debería afectar).
- Sin RLS por vendedor (fase 4 del plan de g360-ventas-pulse); la anon key sigue siendo
  de solo lectura.
- `nro_doc` NO es el RUC del cliente (es el número de la venta) — no usar para buscar
  clientes.
