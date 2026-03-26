import { useMemo, useState } from "react";
import InventarioProductosTable from "../../components/productos/InventarioProductosTable";
import { useInventarioProductosList } from "../../hooks/productos/useInventarioProductosList";

const initialSectionFilters = {
  nombre: "",
  codigo: "",
  categoria_id: "",
  estado: "",
};

function InventarioProductosPage() {
  const [accesoriosPage, setAccesoriosPage] = useState(1);
  const [libreriaPage, setLibreriaPage] = useState(1);
  const [accesoriosPerPage, setAccesoriosPerPage] = useState(5);
  const [libreriaPerPage, setLibreriaPerPage] = useState(5);
  const [accesoriosFilters, setAccesoriosFilters] = useState(initialSectionFilters);
  const [libreriaFilters, setLibreriaFilters] = useState(initialSectionFilters);
  const [accesoriosDraftFilters, setAccesoriosDraftFilters] = useState(initialSectionFilters);
  const [libreriaDraftFilters, setLibreriaDraftFilters] = useState(initialSectionFilters);

  const accesoriosQuery = useMemo(
    () => ({
      page: accesoriosPage,
      per_page: accesoriosPerPage,
      seccion: "accesorios",
      ...accesoriosFilters,
    }),
    [accesoriosPage, accesoriosPerPage, accesoriosFilters],
  );
  const libreriaQuery = useMemo(
    () => ({
      page: libreriaPage,
      per_page: libreriaPerPage,
      seccion: "libreria",
      ...libreriaFilters,
    }),
    [libreriaPage, libreriaPerPage, libreriaFilters],
  );
  const accesoriosListado = useInventarioProductosList(accesoriosQuery);
  const libreriaListado = useInventarioProductosList(libreriaQuery);

  function updateSectionFilters(setter, name, value) {
    setter((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function clearSectionFilters(setDraft, setApplied, setPage) {
    setDraft(initialSectionFilters);
    setApplied(initialSectionFilters);
    setPage(1);
  }

  function applySectionFilters(draftFilters, setApplied, setPage) {
    setApplied(draftFilters);
    setPage(1);
  }

  return (
    <section>
      <div className="products-page__header">
        <div>
          <p className="section-kicker">Productos</p>
          <h2>Submodulo inventario</h2>
          <p className="muted-text">
            Tabla con los productos registrados desde el modulo Productos.
          </p>
        </div>
      </div>

      {accesoriosListado.error ? <div className="alert alert-danger">{accesoriosListado.error}</div> : null}
      {libreriaListado.error ? <div className="alert alert-danger">{libreriaListado.error}</div> : null}

      <InventarioProductosTable
        accesoriosRegistros={accesoriosListado.registros}
        accesoriosLoading={accesoriosListado.loading}
        accesoriosMeta={accesoriosListado.meta}
        onAccesoriosPageChange={setAccesoriosPage}
        accesoriosPerPage={accesoriosPerPage}
        onAccesoriosPerPageChange={(value) => {
          setAccesoriosPerPage(value);
          setAccesoriosPage(1);
        }}
        accesoriosFilters={accesoriosDraftFilters}
        onAccesoriosFilterChange={(name, value) => updateSectionFilters(setAccesoriosDraftFilters, name, value)}
        onAccesoriosFiltersApply={() => applySectionFilters(accesoriosDraftFilters, setAccesoriosFilters, setAccesoriosPage)}
        onAccesoriosFiltersClear={() => clearSectionFilters(
          setAccesoriosDraftFilters,
          setAccesoriosFilters,
          setAccesoriosPage,
        )}
        libreriaRegistros={libreriaListado.registros}
        libreriaLoading={libreriaListado.loading}
        libreriaMeta={libreriaListado.meta}
        onLibreriaPageChange={setLibreriaPage}
        libreriaPerPage={libreriaPerPage}
        onLibreriaPerPageChange={(value) => {
          setLibreriaPerPage(value);
          setLibreriaPage(1);
        }}
        libreriaFilters={libreriaDraftFilters}
        onLibreriaFilterChange={(name, value) => updateSectionFilters(setLibreriaDraftFilters, name, value)}
        onLibreriaFiltersApply={() => applySectionFilters(libreriaDraftFilters, setLibreriaFilters, setLibreriaPage)}
        onLibreriaFiltersClear={() => clearSectionFilters(
          setLibreriaDraftFilters,
          setLibreriaFilters,
          setLibreriaPage,
        )}
      />
    </section>
  );
}

export default InventarioProductosPage;
