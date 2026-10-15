/**
 * Paginador.jsx
 * Paginación con salto directo: primera/anterior · números con elipsis · siguiente/última.
 * Responsive: botones compactos en móvil (touch ≥36px) y contenedor con scroll horizontal.
 */

// Ventana de páginas: primera, última, actual ±1, con '...' en los huecos
function buildPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const rango = [];
  for (let i = Math.max(1, current - 1); i <= Math.min(total, current + 1); i++) rango.push(i);
  const unicos = [...new Set([1, ...rango, total])].sort((a, b) => a - b);
  const pages = [];
  let prev = 0;
  for (const p of unicos) {
    if (p - prev > 1) pages.push('...');
    pages.push(p);
    prev = p;
  }
  return pages;
}

export default function Paginador({ page, total, onChange }) {
  if (!total || total <= 1) return null;

  const ir = (p) => {
    if (p >= 1 && p <= total && p !== page) onChange(p);
  };

  const btnBase = 'w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-xl border border-[var(--g360-border)] flex items-center justify-center font-black transition-all disabled:opacity-20 disabled:pointer-events-none';
  const btnNav = `${btnBase} text-[var(--g360-muted)] hover:bg-[var(--g360-surface)] hover:text-[var(--g360-accent)]`;
  const btnNum = (p) => `${btnBase} text-xs ${p === page
    ? 'bg-[var(--g360-accent)] text-black border-[var(--g360-accent)] shadow-lg shadow-[var(--g360-accent)]/30'
    : 'text-[var(--g360-muted)] hover:bg-[var(--g360-surface)] hover:text-[var(--g360-accent)]'}`;

  return (
    <nav className="flex flex-col items-center gap-3 py-8" aria-label="Paginación de productos">
      <div className="flex items-center gap-1.5 sm:gap-2 max-w-full overflow-x-auto no-scrollbar px-2 py-1">
        <button onClick={() => ir(1)} disabled={page === 1} className={btnNav} aria-label="Primera página">
          <span className="material-symbols-outlined text-lg sm:text-xl">first_page</span>
        </button>
        <button onClick={() => ir(page - 1)} disabled={page === 1} className={btnNav} aria-label="Página anterior">
          <span className="material-symbols-outlined text-lg sm:text-xl">chevron_left</span>
        </button>

        {buildPages(page, total).map((p, i) => p === '...'
          ? <span key={`e${i}`} className="w-5 shrink-0 text-center text-[var(--g360-muted)] text-xs font-black select-none">…</span>
          : (
            <button key={p} onClick={() => ir(p)} className={btnNum(p)} aria-current={p === page ? 'page' : undefined} aria-label={`Página ${p}`}>
              {p}
            </button>
          )
        )}

        <button onClick={() => ir(page + 1)} disabled={page === total} className={btnNav} aria-label="Página siguiente">
          <span className="material-symbols-outlined text-lg sm:text-xl">chevron_right</span>
        </button>
        <button onClick={() => ir(total)} disabled={page === total} className={btnNav} aria-label="Última página">
          <span className="material-symbols-outlined text-lg sm:text-xl">last_page</span>
        </button>
      </div>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--g360-muted)]">
        Página <span className="text-[var(--g360-text)]">{page}</span> de {total}
      </p>
    </nav>
  );
}
