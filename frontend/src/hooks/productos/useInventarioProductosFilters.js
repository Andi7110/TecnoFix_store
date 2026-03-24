import { useState } from "react";
import { normalizeProductCodeInput } from "../../utils/productCode";

const initialFilters = {
  modulo_id: "",
  categoria_id: "",
  codigo: "",
  nombre: "",
  fecha_desde: "",
  fecha_hasta: "",
  page: 1,
  per_page: 10,
};

export function useInventarioProductosFilters() {
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);

  function updateDraftFilter(name, value) {
    const nextValue = name === "codigo" ? normalizeProductCodeInput(value) : value;

    setDraftFilters((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === "modulo_id" ? { categoria_id: "" } : {}),
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
