import { useState } from "react";

const initialFilters = {
  modulo_id: "",
  numero_venta: "",
  metodo_pago: "",
  fecha_desde: "",
  fecha_hasta: "",
  page: 1,
  per_page: 10,
};

export function useVentasFilters() {
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);

  function updateDraftFilter(name, value) {
    setDraftFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function applyFilters(event) {
    event?.preventDefault();

    setFilters((current) => ({
      ...current,
      ...draftFilters,
      page: 1,
    }));
  }

  function clearFilters() {
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
  }

  function changePage(page) {
    setFilters((current) => ({
      ...current,
      page,
    }));
  }

  return {
    filters,
    draftFilters,
    updateDraftFilter,
    applyFilters,
    clearFilters,
    changePage,
  };
}
