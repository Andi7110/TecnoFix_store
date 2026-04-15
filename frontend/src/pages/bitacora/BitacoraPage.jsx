import BitacoraFilters from "../../components/bitacora/BitacoraFilters";
import BitacoraTable from "../../components/bitacora/BitacoraTable";
import ProductosPagination from "../../components/productos/ProductosPagination";
import { useBitacoraFilters } from "../../hooks/bitacora/useBitacoraFilters";
import { useBitacoraList } from "../../hooks/bitacora/useBitacoraList";

function BitacoraPage() {
  const {
    filters,
    draftFilters,
    updateDraftFilter,
    applyFilters,
    clearFilters,
    changePage,
    changePerPage,
  } = useBitacoraFilters();
  const { movimientos, meta, loading, error } = useBitacoraList(filters);

  return (
    <section>
      <div className="products-page__header">
        <div>
          <p className="section-kicker">Bitacora</p>
          <h2>Movimientos del sistema</h2>
          <p className="muted-text">
            Consulta acciones registradas por usuario, modulo, fecha y resultado.
          </p>
        </div>
      </div>

      <BitacoraFilters
        values={draftFilters}
        onChange={updateDraftFilter}
        onSubmit={applyFilters}
        onClear={clearFilters}
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <BitacoraTable movimientos={movimientos} loading={loading} />

      <ProductosPagination
        meta={meta}
        onPageChange={changePage}
        showWhenSinglePage
        perPage={filters.per_page}
        onPerPageChange={changePerPage}
      />
    </section>
  );
}

export default BitacoraPage;
