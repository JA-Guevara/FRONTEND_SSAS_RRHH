type PaginationProps = {
  page: number
  perPage: number
  total: number
  onPageChange: (page: number) => void
  onPerPageChange?: (perPage: number) => void
  perPageOptions?: number[]
}

function visiblePages(page: number, totalPages: number): number[] {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  const end = Math.min(totalPages, start + 4)
  const pages: number[] = []
  for (let current = start; current <= end; current += 1) pages.push(current)
  return pages
}

/** Paginación real contra el servidor: el backend ya devuelve `total` en todos los listados. */
export function Pagination({
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const from = total === 0 ? 0 : (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  return (
    <nav className="pagination" aria-label="Paginación">
      <p className="pagination-info">
        {total === 0 ? 'Sin registros' : `Mostrando ${from}–${to} de ${total}`}
      </p>
      <div className="pagination-controls">
        {onPerPageChange !== undefined && (
          <label className="pagination-info">
            Por página{' '}
            <select
              value={perPage}
              onChange={(event) => onPerPageChange(Number(event.target.value))}
              aria-label="Registros por página"
            >
              {perPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          className="pagination-page"
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Anterior
        </button>
        {visiblePages(page, totalPages).map((current) => (
          <button
            key={current}
            className="pagination-page"
            type="button"
            aria-current={current === page ? 'page' : undefined}
            onClick={() => onPageChange(current)}
          >
            {current}
          </button>
        ))}
        <button
          className="pagination-page"
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Siguiente
        </button>
      </div>
    </nav>
  )
}
