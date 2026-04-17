import { useEffect, useMemo, useState } from "react";
import {
  createTransferAccount,
  deleteTransferAccount,
  createVenta,
  getDailySalesReport,
  listTransferAccounts,
} from "../../api/ventas";
import { listProductos } from "../../api/productos";
import { formatMoneyInput, normalizeMoneyInput } from "../../utils/currencyInput";

const SUSPENDED_SALES_KEY = "tecnofix-pos-suspended-sales";
const TICKET_CONFIG_KEY = "tecnofix-pos-ticket-config";

function getLocalDateTimeValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60000);

  return localDate.toISOString().slice(0, 16);
}

function createInitialValues() {
  return {
    modulo_id: "",
    categoria_id: "",
    fecha_venta: getLocalDateTimeValue(),
    descuento: "",
    metodo_pago: "efectivo",
    cliente_transferente: "",
    referencia_transferencia: "",
    nota_transferencia: "",
    observacion: "",
  };
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeScannerInput(value) {
  return normalizeText(
    String(value ?? "")
      .replace(/\r?\n/g, "")
      .replace(/^\*+|\*+$/g, "")
      .trim(),
  );
}

function loadFromStorage(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);

    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
}

function buildSuspendedSaleSnapshot({ values, items, montoRecibido, montoTransferencia }) {
  const now = new Date();

  return {
    id: `suspended-${now.getTime()}`,
    created_at: now.toISOString(),
    modulo_id: values.modulo_id,
    metodo_pago: values.metodo_pago,
    observacion: values.observacion,
    items_count: items.reduce((accumulator, item) => accumulator + Number(item.cantidad ?? 0), 0),
    values,
    items,
    montoRecibido,
    montoTransferencia,
  };
}

function buildTransferSummary({
  values,
  transferAccount,
  montoRecibido,
  montoTransferencia,
}) {
  const lines = [];

  if (values.metodo_pago !== "transferencia" && values.metodo_pago !== "mixto") {
    return "";
  }

  lines.push("Datos de transferencia:");

  if (transferAccount.bank_name?.trim()) {
    lines.push(`Banco: ${transferAccount.bank_name.trim()}`);
  }

  if (transferAccount.account_number?.trim()) {
    lines.push(`Numero de cuenta: ${transferAccount.account_number.trim()}`);
  }

  if (transferAccount.owner_name?.trim()) {
    lines.push(`Propietario: ${transferAccount.owner_name.trim()}`);
  }

  if (transferAccount.owner_type?.trim()) {
    lines.push(`Tipo: ${transferAccount.owner_type.trim()}`);
  }

  if (values.cliente_transferente?.trim()) {
    lines.push(`Cliente que transfiere: ${values.cliente_transferente.trim()}`);
  }

  if (values.referencia_transferencia?.trim()) {
    lines.push(`Referencia: ${values.referencia_transferencia.trim()}`);
  }

  if (values.nota_transferencia?.trim()) {
    lines.push(`Nota de transferencia: ${values.nota_transferencia.trim()}`);
  }

  if (values.metodo_pago === "transferencia") {
    lines.push(`Monto transferido: ${Number(montoTransferencia || 0).toFixed(2)}`);
  }

  if (values.metodo_pago === "mixto") {
    lines.push(`Monto en efectivo: ${Number(montoRecibido || 0).toFixed(2)}`);
    lines.push(`Monto por transferencia: ${Number(montoTransferencia || 0).toFixed(2)}`);
  }

  return lines.join("\n");
}

function createEmptyTransferAccount() {
  return {
    id: null,
    bank_name: "",
    account_number: "",
    owner_name: "",
    owner_type: "Natural",
    is_active: true,
  };
}

export function useVentaForm({ onSuccess }) {
  const [values, setValues] = useState(createInitialValues);
  const [items, setItems] = useState([]);
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [montoRecibido, setMontoRecibido] = useState("");
  const [montoTransferencia, setMontoTransferencia] = useState("");
  const [ticketConfig, setTicketConfig] = useState(() => loadFromStorage(TICKET_CONFIG_KEY, {
    businessName: "TecnoFix",
    businessPhone: "",
    businessAddress: "",
    footerNote: "Gracias por tu compra",
  }));
  const [transferAccounts, setTransferAccounts] = useState([]);
  const [selectedTransferAccountId, setSelectedTransferAccountId] = useState(null);
  const [transferAccountDraft, setTransferAccountDraft] = useState(createEmptyTransferAccount);
  const [loadingTransferAccounts, setLoadingTransferAccounts] = useState(false);
  const [savingTransferAccount, setSavingTransferAccount] = useState(false);
  const [transferAccountsError, setTransferAccountsError] = useState("");
  const [ventasSuspendidas, setVentasSuspendidas] = useState(() => loadFromStorage(SUSPENDED_SALES_KEY, []));
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [topProductosIds, setTopProductosIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(TICKET_CONFIG_KEY, JSON.stringify(ticketConfig));
  }, [ticketConfig]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(SUSPENDED_SALES_KEY, JSON.stringify(ventasSuspendidas));
  }, [ventasSuspendidas]);

  useEffect(() => {
    let ignore = false;

    async function loadAccounts() {
      setLoadingTransferAccounts(true);
      setTransferAccountsError("");

      try {
        const accounts = await listTransferAccounts();

        if (ignore) {
          return;
        }

        setTransferAccounts(accounts);
        setSelectedTransferAccountId(accounts[0]?.id ?? null);
      } catch (requestError) {
        if (!ignore) {
          setTransferAccounts([]);
          setSelectedTransferAccountId(null);
          setTransferAccountsError(
            requestError?.response?.data?.message
              || "No se pudieron cargar las cuentas de transferencia.",
          );
        }
      } finally {
        if (!ignore) {
          setLoadingTransferAccounts(false);
        }
      }
    }

    loadAccounts();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadProductos() {
      if (!values.modulo_id) {
        setProductos([]);
        return;
      }

      setLoadingProductos(true);

      try {
        const response = await listProductos({
          modulo_id: values.modulo_id,
          estado: true,
          con_stock: true,
          per_page: 100,
          page: 1,
        });

        if (!ignore) {
          setProductos(response.data ?? []);
        }
      } catch (requestError) {
        if (!ignore) {
          setProductos([]);
          setErrorMessage(
            requestError?.response?.data?.message
              || "No se pudieron cargar los productos del modulo seleccionado.",
          );
        }
      } finally {
        if (!ignore) {
          setLoadingProductos(false);
        }
      }
    }

    loadProductos();

    return () => {
      ignore = true;
    };
  }, [values.modulo_id]);

  useEffect(() => {
    let ignore = false;

    async function loadTopProductos() {
      if (!values.modulo_id) {
        setTopProductosIds([]);
        return;
      }

      try {
        const report = await getDailySalesReport({
          modulo_id: values.modulo_id,
        });

        if (ignore) {
          return;
        }

        const topIds = Array.isArray(report?.top_productos)
          ? report.top_productos
            .map((item) => Number(item?.producto_id))
            .filter((value) => Number.isFinite(value) && value > 0)
          : [];

        setTopProductosIds(topIds);
      } catch {
        if (!ignore) {
          setTopProductosIds([]);
        }
      }
    }

    loadTopProductos();

    return () => {
      ignore = true;
    };
  }, [values.modulo_id]);

  const filteredProductos = useMemo(() => {
    const term = normalizeText(searchTerm);
    const selectedCategoriaId = String(values.categoria_id ?? "");
    const topRank = new Map(topProductosIds.map((id, index) => [Number(id), index]));

    const visibleProductos = productos
      .filter((producto) => {
        const matchesCategoria = !selectedCategoriaId
          || String(producto.categoria_id ?? producto.categoria?.id ?? "") === selectedCategoriaId;

        if (!matchesCategoria) {
          return false;
        }

        if (!term) {
          return true;
        }

        return normalizeText(producto.nombre).includes(term)
          || normalizeText(producto.codigo).includes(term);
      })
      .sort((first, second) => {
        const firstRank = topRank.has(Number(first.id)) ? topRank.get(Number(first.id)) : Number.POSITIVE_INFINITY;
        const secondRank = topRank.has(Number(second.id)) ? topRank.get(Number(second.id)) : Number.POSITIVE_INFINITY;

        if (firstRank !== secondRank) {
          return firstRank - secondRank;
        }

        return Number(second.id) - Number(first.id);
      });

    return selectedCategoriaId ? visibleProductos : visibleProductos.slice(0, 8);
  }, [productos, searchTerm, topProductosIds, values.categoria_id]);

  const subtotal = useMemo(
    () => items.reduce(
      (accumulator, item) => accumulator + (Number(item.precio_unitario) * Number(item.cantidad)),
      0,
    ),
    [items],
  );
  const descuento = Number(values.descuento || 0);
  const total = Math.max(0, subtotal - descuento);
  const montoRecibidoNormalizado = Number(montoRecibido || 0);
  const montoTransferenciaNormalizado = Number(montoTransferencia || 0);
  const totalPagado = values.metodo_pago === "transferencia"
    ? montoTransferenciaNormalizado
    : values.metodo_pago === "mixto"
      ? montoRecibidoNormalizado + montoTransferenciaNormalizado
      : montoRecibidoNormalizado;
  const cambio = Math.max(0, totalPagado - total);
  const faltante = Math.max(0, total - totalPagado);
  const productosCriticos = useMemo(
    () => items.filter((item) => Number(item.stock_disponible) === 2),
    [items],
  );
  const productosSugeridos = useMemo(() => {
    const seleccionados = new Set(items.map((item) => Number(item.producto_id)));

    return filteredProductos
      .filter((producto) => !seleccionados.has(Number(producto.id)))
      .sort((first, second) => {
        const firstLowStock = Number(first.stock_bajo) ? 1 : 0;
        const secondLowStock = Number(second.stock_bajo) ? 1 : 0;

        if (firstLowStock !== secondLowStock) {
          return firstLowStock - secondLowStock;
        }

        const firstMargin = Number(first.precio_venta ?? 0) - Number(first.precio_compra ?? 0);
        const secondMargin = Number(second.precio_venta ?? 0) - Number(second.precio_compra ?? 0);

        if (firstMargin !== secondMargin) {
          return secondMargin - firstMargin;
        }

        return Number(second.stock ?? 0) - Number(first.stock ?? 0);
      })
      .slice(0, 4);
  }, [filteredProductos, items]);
  const resumenVenta = useMemo(() => ({
    items_count: items.reduce((accumulator, item) => accumulator + Number(item.cantidad ?? 0), 0),
    productos_count: items.length,
  }), [items]);
  const isCreatingTransferAccount = selectedTransferAccountId === "new";
  const transferAccount = useMemo(() => {
    if (isCreatingTransferAccount) {
      return transferAccountDraft;
    }

    return transferAccounts.find((account) => Number(account.id) === Number(selectedTransferAccountId))
      ?? createEmptyTransferAccount();
  }, [isCreatingTransferAccount, selectedTransferAccountId, transferAccountDraft, transferAccounts]);

  function updateField(name, value) {
    const nextValue = name === "descuento"
      ? normalizeMoneyInput(value)
      : value;

    setValues((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === "modulo_id" ? { categoria_id: "" } : {}),
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }));

    if (name === "modulo_id") {
      setItems([]);
      setSearchTerm("");
      setMontoRecibido("");
      setMontoTransferencia("");
    }

  }

  function formatDiscount() {
    setValues((current) => ({
      ...current,
      descuento: formatMoneyInput(current.descuento),
    }));
  }

  function addProducto(producto) {
    setItems((current) => {
      const existingItem = current.find(
        (item) => Number(item.producto_id) === Number(producto.id),
      );

      if (existingItem) {
        return current.map((item) => {
          if (Number(item.producto_id) !== Number(producto.id)) {
            return item;
          }

          const nextCantidad = Math.min(
            Number(item.cantidad) + 1,
            Number(item.stock_disponible),
          );

          return {
            ...item,
            cantidad: nextCantidad,
          };
        });
      }

      return [
        ...current,
        {
          producto_id: producto.id,
          codigo: producto.codigo,
          nombre: producto.nombre,
          unidad_medida: producto.unidad_medida,
          stock_disponible: Number(producto.stock ?? 0),
          precio_unitario: formatMoneyInput(producto.precio_venta),
          cantidad: 1,
        },
      ];
    });

    setErrors((current) => ({
      ...current,
      items: undefined,
    }));
  }

  function addProductoBySearch(rawValue = searchTerm) {
    if (!values.modulo_id) {
      return;
    }

    const term = normalizeScannerInput(rawValue);

    if (!term) {
      return;
    }

    const exactMatch = filteredProductos.find((producto) => (
      normalizeText(producto.codigo) === term || normalizeText(producto.nombre) === term
    ));

    if (exactMatch) {
      addProducto(exactMatch);
      setSearchTerm("");
      return;
    }

    if (filteredProductos.length === 1) {
      addProducto(filteredProductos[0]);
      setSearchTerm("");
    }
  }

  function removeItem(productoId) {
    setItems((current) => current.filter(
      (item) => Number(item.producto_id) !== Number(productoId),
    ));
  }

  function updateItem(productoId, field, value) {
    setItems((current) => current.map((item) => {
      if (Number(item.producto_id) !== Number(productoId)) {
        return item;
      }

      if (field === "cantidad") {
        const parsed = String(value ?? "").replace(/\D/g, "");
        const cantidad = Math.max(
          1,
          Math.min(Number(parsed || 1), Number(item.stock_disponible)),
        );

        return {
          ...item,
          cantidad,
        };
      }

      return {
        ...item,
        [field]: normalizeMoneyInput(value),
      };
    }));
  }

  function formatItemPrice(productoId) {
    setItems((current) => current.map((item) => (
      Number(item.producto_id) === Number(productoId)
        ? { ...item, precio_unitario: formatMoneyInput(item.precio_unitario) }
        : item
    )));
  }

  function updateMontoRecibido(value) {
    setMontoRecibido(normalizeMoneyInput(value));
    setErrors((current) => ({
      ...current,
      monto_recibido: undefined,
      pago_mixto: undefined,
    }));
  }

  function formatMontoRecibido() {
    setMontoRecibido((current) => formatMoneyInput(current));
  }

  function updateMontoTransferencia(value) {
    setMontoTransferencia(normalizeMoneyInput(value));
    setErrors((current) => ({
      ...current,
      monto_transferencia: undefined,
      pago_mixto: undefined,
    }));
  }

  function formatMontoTransferencia() {
    setMontoTransferencia((current) => formatMoneyInput(current));
  }

  function applyQuickCash(amount) {
    setMontoRecibido(formatMoneyInput(amount));
  }

  function updateTicketField(name, value) {
    setTicketConfig((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateTransferAccountField(name, value) {
    setTransferAccountDraft((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function selectTransferAccount(accountId) {
    setSelectedTransferAccountId(accountId);
    setTransferAccountsError("");
  }

  async function addTransferAccount() {
    setSelectedTransferAccountId("new");
    setTransferAccountDraft(createEmptyTransferAccount());
    setTransferAccountsError("");
  }

  async function saveSelectedTransferAccount() {
    if (!isCreatingTransferAccount) {
      return;
    }

    setSavingTransferAccount(true);
    setTransferAccountsError("");

    try {
      const account = await createTransferAccount({
        bank_name: transferAccountDraft.bank_name ?? "",
        account_number: transferAccountDraft.account_number ?? "",
        owner_name: transferAccountDraft.owner_name ?? "",
        owner_type: transferAccountDraft.owner_type ?? "Natural",
        is_active: Boolean(transferAccountDraft.is_active ?? true),
      });

      setTransferAccounts((current) => [account, ...current]);
      setSelectedTransferAccountId(account.id);
    } catch (requestError) {
      setTransferAccountsError(
        requestError?.response?.data?.message
          || "No se pudo crear una nueva cuenta.",
      );
    } finally {
      setSavingTransferAccount(false);
    }
  }

  async function deleteSelectedTransferAccount() {
    if (!selectedTransferAccountId || isCreatingTransferAccount) {
      return;
    }

    setSavingTransferAccount(true);
    setTransferAccountsError("");

    try {
      const accountId = selectedTransferAccountId;

      await deleteTransferAccount(accountId);

      setTransferAccounts((current) => {
        const nextAccounts = current.filter((account) => Number(account.id) !== Number(accountId));
        setSelectedTransferAccountId(nextAccounts[0]?.id ?? null);
        return nextAccounts;
      });
    } catch (requestError) {
      setTransferAccountsError(
        requestError?.response?.data?.message
          || "No se pudo eliminar la cuenta seleccionada.",
      );
    } finally {
      setSavingTransferAccount(false);
    }
  }

  function resetForm(nextValues = createInitialValues()) {
    setValues(nextValues);
    setItems([]);
    setProductos([]);
    setSearchTerm("");
    setMontoRecibido("");
    setMontoTransferencia("");
    setErrors({});
    setErrorMessage("");
  }

  function suspendCurrentSale() {
    if (items.length === 0) {
      setErrors({
        items: ["Agrega al menos un articulo antes de suspender la venta."],
      });
      return;
    }

    const snapshot = buildSuspendedSaleSnapshot({
      values,
      items,
      montoRecibido,
      montoTransferencia,
    });

    setVentasSuspendidas((current) => [snapshot, ...current].slice(0, 12));
    resetForm();
  }

  function resumeSuspendedSale(saleId) {
    const suspendedSale = ventasSuspendidas.find((sale) => sale.id === saleId);

    if (!suspendedSale) {
      return;
    }

    setValues(suspendedSale.values);
    setItems(suspendedSale.items);
    setMontoRecibido(suspendedSale.montoRecibido ?? "");
    setMontoTransferencia(suspendedSale.montoTransferencia ?? "");
    setSearchTerm("");
    setErrors({});
    setErrorMessage("");
    setVentasSuspendidas((current) => current.filter((sale) => sale.id !== saleId));
  }

  function removeSuspendedSale(saleId) {
    setVentasSuspendidas((current) => current.filter((sale) => sale.id !== saleId));
  }

  async function submit(event) {
    event.preventDefault();

    setSaving(true);
    setErrors({});
    setErrorMessage("");

    if (!values.modulo_id) {
      setErrors({ modulo_id: ["Selecciona un modulo para la venta."] });
      setSaving(false);
      return;
    }

    if (items.length === 0) {
      setErrors({ items: ["Agrega al menos un articulo a la venta."] });
      setSaving(false);
      return;
    }

    if (descuento > subtotal) {
      setErrors({ descuento: ["El descuento no puede ser mayor que el subtotal."] });
      setSaving(false);
      return;
    }

    if (values.metodo_pago === "efectivo" && total > 0 && montoRecibidoNormalizado < total) {
      setErrors({
        monto_recibido: ["El monto recibido debe cubrir el total para ventas en efectivo."],
      });
      setSaving(false);
      return;
    }

    if (values.metodo_pago === "transferencia" && total > 0 && montoTransferenciaNormalizado < total) {
      setErrors({
        monto_transferencia: ["El monto transferido debe cubrir el total de la venta."],
      });
      setSaving(false);
      return;
    }

    if (values.metodo_pago === "mixto" && total > 0 && totalPagado < total) {
      setErrors({
        pago_mixto: ["La suma de efectivo y transferencia debe cubrir el total de la venta."],
      });
      setSaving(false);
      return;
    }

    const payload = {
      modulo_id: Number(values.modulo_id),
      fecha_venta: values.fecha_venta,
      descuento: descuento || 0,
      metodo_pago: values.metodo_pago,
      observacion: [values.observacion.trim(), buildTransferSummary({
        values,
        transferAccount,
        montoRecibido,
        montoTransferencia,
      })]
        .filter(Boolean)
        .join("\n\n") || null,
      items: items.map((item) => ({
        producto_id: Number(item.producto_id),
        descripcion_item: item.nombre,
        cantidad: Number(item.cantidad),
        precio_unitario: Number(item.precio_unitario || 0),
      })),
    };

    try {
      const venta = await createVenta(payload);
      resetForm();
      onSuccess?.(venta, ticketConfig);
    } catch (requestError) {
      const validationErrors = requestError?.response?.data?.errors;

      if (validationErrors) {
        setErrors(validationErrors);
      }

      setErrorMessage(
        requestError?.response?.data?.message
          || "No se pudo registrar la venta.",
      );
    } finally {
      setSaving(false);
    }
  }

  return {
    values,
    items,
    productos: filteredProductos,
    allProductos: productos,
    searchTerm,
    loadingProductos,
    saving,
    errors,
    errorMessage,
    subtotal,
    descuento,
    total,
    montoRecibido,
    montoTransferencia,
    totalPagado,
    cambio,
    faltante,
    productosCriticos,
    productosSugeridos,
    resumenVenta,
    ticketConfig,
    transferAccounts,
    transferAccount,
    selectedTransferAccountId,
    isCreatingTransferAccount,
    loadingTransferAccounts,
    savingTransferAccount,
    transferAccountsError,
    ventasSuspendidas,
    updateField,
    formatDiscount,
    setSearchTerm,
    addProductoBySearch,
    addProducto,
    removeItem,
    updateItem,
    formatItemPrice,
    updateMontoRecibido,
    formatMontoRecibido,
    updateMontoTransferencia,
    formatMontoTransferencia,
    applyQuickCash,
    updateTicketField,
    updateTransferAccountField,
    selectTransferAccount,
    addTransferAccount,
    saveSelectedTransferAccount,
    deleteSelectedTransferAccount,
    suspendCurrentSale,
    resumeSuspendedSale,
    removeSuspendedSale,
    submit,
  };
}
