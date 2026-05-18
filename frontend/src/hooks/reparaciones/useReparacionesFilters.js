import { useState } from "react";

const initialFilters = {
  estado: "",
  cliente: "",
  telefono: "",
  marca: "",
  modelo: "",
  saldo: "",
  fecha_desde: "",
  fecha_hasta: "",
  page: 1,
  per_page: 5,
};

export function useReparacionesFilters() {
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
      page: 1,
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
