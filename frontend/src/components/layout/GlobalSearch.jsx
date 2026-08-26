import { useEffect, useMemo, useRef, useState } from "react";
import {
  Group,
  Header,
  Input,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  SearchField,
} from "react-aria-components";
import {
  ClockCounterClockwise,
  MagnifyingGlass,
  Package,
  SpinnerGap,
  Wrench,
} from "../../icons/phosphor";
import { getProducto, getProductosPaginados } from "../../api/productos";
import { getReparacionesPaginadas } from "../../api/reparaciones";

const RECENT_SEARCHES_KEY = "tecnofix-global-search-recent";

function normalizeSearchResponse(response, type) {
  const items = Array.isArray(response?.data) ? response.data : [];

  return items
    .filter((item) => item && item.id !== undefined && item.id !== null)
    .map((item) => ({ id: `${type}-${item.id}`, type, item }));
}

function readRecentSearches() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = JSON.parse(window.localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]");
    return Array.isArray(stored) ? stored.filter((result) => result?.id && result?.item) : [];
  } catch {
    return [];
  }
}

function resultTitle(result) {
  return result.type === "producto"
    ? result.item.nombre || "Producto sin nombre"
    : result.item.cliente?.nombre || "Cliente sin nombre";
}

function resultSubtitle(result) {
  if (result.type === "producto") {
    return result.item.codigo || "Sin codigo";
  }

  return [result.item.marca, result.item.modelo].filter(Boolean).join(" ") || "Equipo sin modelo";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlight({ text, query }) {
  const terms = query.trim().split(/\s+/).filter(Boolean);

  if (!terms.length || !text) {
    return text;
  }

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");

  const normalizedTerms = terms.map((term) => term.toLocaleLowerCase("es"));

  return String(text).split(pattern).map((part, index) => (
    normalizedTerms.includes(part.toLocaleLowerCase("es"))
      ? <mark key={`${part}-${index}`}>{part}</mark>
      : <span key={`${part}-${index}`}>{part}</span>
  ));
}

function statusLabel(status) {
  const labels = {
    registrado: "Registrada",
    en_proceso: "En proceso",
    terminado: "Terminada",
    entregado: "Entregada",
    cancelado: "Cancelada",
  };

  return labels[status] ?? "Reparacion";
}

function SearchResult({ result, query, recent = false }) {
  const isProduct = result.type === "producto";
  const item = result.item;
  const stock = Number(item.stock ?? 0);
  const stockMinimum = Number(item.stock_minimo ?? 0);
  const stockTone = stock <= 0 ? "is-empty" : stock <= stockMinimum ? "is-low" : "is-available";

  return (
    <div className="global-search-result__inner">
      <span className={`global-search-result__icon is-${result.type}`}>
        {isProduct && item.foto_url ? (
          <img src={item.foto_url} alt="" />
        ) : isProduct ? (
          <Package size={20} weight="duotone" aria-hidden="true" />
        ) : (
          <Wrench size={20} weight="duotone" aria-hidden="true" />
        )}
      </span>

      <span className="global-search-result__copy">
        <strong><Highlight text={resultTitle(result)} query={query} /></strong>
        <small><Highlight text={resultSubtitle(result)} query={query} /></small>
      </span>

      <span className="global-search-result__meta">
        {recent ? <small>Reciente</small> : <small>{isProduct ? "Producto" : item.codigo_reparacion || "Taller"}</small>}
        {isProduct ? (
          <strong className={`global-search-result__stock ${stockTone}`}>
            {stock > 0
              ? item.maneja_variantes
                ? `${item.variantes_disponibles_count} diseños`
                : `${stock} disponibles`
              : "Agotado"}
          </strong>
        ) : (
          <strong>{statusLabel(item.estado_reparacion)}</strong>
        )}
      </span>
    </div>
  );
}

function GlobalSearch({ canSearchProducts, canSearchRepairs, onProductSelect, onRepairSelect, resetToken }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recentResults, setRecentResults] = useState(readRecentSearches);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const normalizedQuery = query.trim();

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!searchRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    setQuery("");
    setResults([]);
    setError("");
    setLoading(false);
    setIsOpen(false);
  }, [resetToken]);

  useEffect(() => {
    if (normalizedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      setError("");
      return undefined;
    }

    const controller = new AbortController();
    let ignore = false;
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      setResults([]);

      const requests = [];

      if (canSearchProducts) {
        requests.push(
          getProductosPaginados(
            { q: normalizedQuery, per_page: 6 },
            { signal: controller.signal },
          ).then((response) => normalizeSearchResponse(response, "producto")),
        );
      }

      if (canSearchRepairs) {
        requests.push(
          getReparacionesPaginadas(
            { q: normalizedQuery, per_page: 6 },
            { signal: controller.signal },
          ).then((response) => normalizeSearchResponse(response, "reparacion")),
        );
      }

      try {
        const settled = await Promise.allSettled(requests);

        if (ignore) {
          return;
        }

        const nextResults = settled
          .filter((result) => result.status === "fulfilled")
          .flatMap((result) => result.value);

        setResults(nextResults);

        if (settled.length > 0 && settled.every((result) => result.status === "rejected")) {
          setError("No se pudo realizar la busqueda. Intenta nuevamente.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }, 280);

    return () => {
      ignore = true;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [canSearchProducts, canSearchRepairs, normalizedQuery]);

  const productResults = useMemo(
    () => results.filter((result) => result.type === "producto"),
    [results],
  );
  const repairResults = useMemo(
    () => results.filter((result) => result.type === "reparacion"),
    [results],
  );
  const visibleRecentResults = normalizedQuery.length < 2 ? recentResults : [];
  const selectableResults = [...visibleRecentResults, ...results];

  function saveRecent(result) {
    const nextRecent = [result, ...recentResults.filter((item) => item.id !== result.id)].slice(0, 5);
    setRecentResults(nextRecent);
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextRecent));
  }

  async function handleSelection(key) {
    if (!key) {
      return;
    }

    const selected = selectableResults.find((result) => result.id === String(key));

    if (!selected) {
      return;
    }

    setIsOpen(false);

    if (selected.type === "producto") {
      setLoading(true);

      try {
        const freshProduct = await getProducto(selected.item.id);
        const freshResult = { ...selected, item: freshProduct };
        saveRecent(freshResult);
        onProductSelect(freshProduct);
      } catch {
        setError("No se pudo actualizar la disponibilidad del producto.");
        setIsOpen(true);
      } finally {
        setLoading(false);
      }
    } else {
      saveRecent(selected);
      onRepairSelect(selected.item.id);
    }
  }

  const hasSearchResults = productResults.length > 0 || repairResults.length > 0;
  const showEmpty = normalizedQuery.length >= 2 && !loading && !error && !hasSearchResults;

  function handleSearchKeyDown(event) {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      const firstOption = searchRef.current?.querySelector('[role="option"]');
      if (firstOption) {
        event.preventDefault();
        firstOption.focus();
      }
    }
  }

  return (
    <div ref={searchRef} className={`app-topbar__search global-search-combobox${isOpen ? " is-open" : ""}`}>
      <SearchField
        className="global-search-field"
        value={query}
        onChange={(value) => {
          setQuery(value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        aria-label="Buscar productos o reparaciones"
      >
        <Group className="global-search-input-group">
          <span className="app-topbar__search-icon" aria-hidden="true">
            <MagnifyingGlass size={17} />
          </span>
          <Input
            ref={inputRef}
            className="form-control"
            placeholder="Buscar productos o reparaciones..."
            onKeyDown={handleSearchKeyDown}
          />
          <kbd className="global-search-shortcut" aria-hidden="true">Ctrl K</kbd>
        </Group>
      </SearchField>

      {isOpen ? <div className="global-search-results global-search-popover" data-entering>
        <div className="global-search-results__heading">
          <span>{visibleRecentResults.length ? "Busquedas recientes" : "Resultados"}</span>
          {loading ? (
            <small className="global-search-results__loading"><SpinnerGap size={14} /> Buscando</small>
          ) : normalizedQuery.length >= 2 ? (
            <small>{results.length} encontrados</small>
          ) : (
            <small>Ctrl K para abrir</small>
          )}
        </div>

        {error ? <p className="global-search-results__message is-error">{error}</p> : null}
        {showEmpty ? <p className="global-search-results__message">No encontramos productos ni reparaciones.</p> : null}
        {!loading && normalizedQuery.length < 2 && !visibleRecentResults.length ? (
          <p className="global-search-results__message">Escribe al menos 2 caracteres para buscar.</p>
        ) : null}

        <ListBox className="global-search-results__list" aria-label="Resultados de busqueda">
          {visibleRecentResults.length ? (
            <ListBoxSection className="global-search-section">
              <Header className="global-search-section__heading">
                <ClockCounterClockwise size={14} /> Recientes
              </Header>
              {visibleRecentResults.map((result) => (
                <ListBoxItem
                  key={result.id}
                  id={result.id}
                  textValue={`${resultTitle(result)} ${resultSubtitle(result)}`}
                  className="global-search-result"
                  onAction={() => handleSelection(result.id)}
                >
                  <SearchResult result={result} query={query} recent />
                </ListBoxItem>
              ))}
            </ListBoxSection>
          ) : null}

          {productResults.length ? (
            <ListBoxSection className="global-search-section">
              <Header className="global-search-section__heading"><Package size={14} /> Productos</Header>
              {productResults.map((result) => (
                <ListBoxItem
                  key={result.id}
                  id={result.id}
                  textValue={`${resultTitle(result)} ${resultSubtitle(result)}`}
                  className="global-search-result"
                  onAction={() => handleSelection(result.id)}
                >
                  <SearchResult result={result} query={query} />
                </ListBoxItem>
              ))}
            </ListBoxSection>
          ) : null}

          {repairResults.length ? (
            <ListBoxSection className="global-search-section">
              <Header className="global-search-section__heading"><Wrench size={14} /> Reparaciones</Header>
              {repairResults.map((result) => (
                <ListBoxItem
                  key={result.id}
                  id={result.id}
                  textValue={`${resultTitle(result)} ${resultSubtitle(result)}`}
                  className="global-search-result"
                  onAction={() => handleSelection(result.id)}
                >
                  <SearchResult result={result} query={query} />
                </ListBoxItem>
              ))}
            </ListBoxSection>
          ) : null}
        </ListBox>
      </div> : null}
    </div>
  );
}

export default GlobalSearch;
