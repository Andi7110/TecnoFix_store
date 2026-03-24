function buildPageItems(currentPage, lastPage) {
  const pages = new Set([1, lastPage, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= lastPage)
    .sort((a, b) => a - b);
  const items = [];

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      items.push("ellipsis");
    }
    items.push(page);
  });

  return items;
}

function ProductosPagination({
  meta,
  onPageChange,
  showWhenSinglePage = false,
  perPage,
  onPerPageChange,
  perPageOptions = [5, 10, 20, 30, 50, 100],
}) {
  if (!meta || (!showWhenSinglePage && meta.last_page <= 1)) {
    return null;
  }

  const pageItems = buildPageItems(meta.current_page, meta.last_page);

  return (
    <div className="products-pagination">
      {typeof onPerPageChange === "function" ? (
        <div className="products-pagination__size">
          <label className="form-label mb-0">Registros</label>
          <select
            className="form-select form-select-sm"
            value={String(perPage ?? meta.per_page ?? 10)}
            onChange={(event) => onPerPageChange(Number(event.target.value))}
          >
            {perPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <button
        type="button"
        className="btn btn-outline-secondary"
        disabled={meta.current_page === 1}
        onClick={() => onPageChange(1)}
      >
        Inicio
      </button>

      <button
        type="button"
        className="btn btn-outline-secondary"
        disabled={meta.current_page === 1}
        onClick={() => onPageChange(meta.current_page - 1)}
      >
        Anterior
      </button>

      <div className="products-pagination__pages">
        {pageItems.map((item, index) => (
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="products-pagination__ellipsis">...</span>
          ) : (
            <button
              key={item}
              type="button"
              className={`btn btn-sm ${item === meta.current_page ? "btn-success" : "btn-outline-secondary"}`}
              onClick={() => onPageChange(item)}
              disabled={item === meta.current_page}
            >
              {item}
            </button>
          )
        ))}
      </div>

      <span className="products-pagination__meta">
        Pagina {meta.current_page} de {meta.last_page}
      </span>

      <button
        type="button"
        className="btn btn-outline-secondary"
        disabled={meta.current_page === meta.last_page}
        onClick={() => onPageChange(meta.current_page + 1)}
      >
        Siguiente
      </button>

      <button
        type="button"
        className="btn btn-outline-secondary"
        disabled={meta.current_page === meta.last_page}
        onClick={() => onPageChange(meta.last_page)}
      >
        Fin
      </button>
    </div>
  );
}

export default ProductosPagination;
