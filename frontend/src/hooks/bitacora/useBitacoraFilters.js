import { useState } from "react";

const initialFilters = {
  buscar: "",
  modulo: "",
  accion: "",
  fecha_desde: "",
  fecha_hasta: "",
  page: 1,
  per_page: 15,
};

export function useBitacoraFilters() {
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

  function changePerPage(perPage) {
    setDraftFilters((current) => ({
      ...current,
      per_page: perPage,
    }));

    setFilters((current) => ({
      ...current,
      per_page: perPage,
      page: 1,
    }));
  }

  return {
    filters,
    draftFilters,
    updateDraftFilter,
    applyFilters,
    clearFilters,
    changePage,
    changePerPage,
  };
}
