# SQL — Índices para búsqueda de clientes sin statement timeout

> **Problema**: la búsqueda de clientes contra `public.ventas` con `%contains%` o prefijos
> hace **full-scan** (no hay índice de texto) y excede el `statement_timeout` de Supabase
> (~3 s) → PostgREST responde `500 { code: "57014" }`.
>
> **Dónde ejecutar**: Supabase → proyecto `g360-ventas-db` → **SQL Editor** → Run.
> Requiere rol con permisos DDL (owner del proyecto, no la anon key).
>
> **Estado del frontend**: `clientesService.js` ya es timeout-safe (estrategia indexada:
> código exacto → RUC completo → prefijo de nombre + 1 reintento). Con estos índices,
> además, la búsqueda por nombre parcial (`contains`) vuelve a ser viable.

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
```

## Verificación post-migración

```sql
explain analyze
select id_cliente, doc_cliente, nom_cliente
from public.ventas
where nom_cliente ilike '%ferreteria%'
limit 10;
-- Esperado: "Bitmap Index Scan on idx_ventas_nom_cliente_trgm", < 100 ms
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
