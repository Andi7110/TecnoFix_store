import { useEffect, useMemo, useState } from "react";
import { createVenta } from "../../api/ventas";
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
    fecha_venta: getLocalDateTimeValue(),
    descuento: "",
    metodo_pago: "efectivo",
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

function buildSuspendedSaleSnapshot({ values, items, montoRecibido }) {
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
  };
}

export function useVentaForm({ onSuccess }) {
  const [values, setValues] = useState(createInitialValues);
  const [items, setItems] = useState([]);
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [montoRecibido, setMontoRecibido] = useState("");
  const [ticketConfig, setTicketConfig] = useState(() => loadFromStorage(TICKET_CONFIG_KEY, {
    businessName: "TecnoFix",
    businessPhone: "",
    businessAddress: "",
    footerNote: "Gracias por tu compra",
  }));
  const [ventasSuspendidas, setVentasSuspendidas] = useState(() => loadFromStorage(SUSPENDED_SALES_KEY, []));
  const [loadingProductos, setLoadingProductos] = useState(false);
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

  const filteredProductos = useMemo(() => {
    const term = normalizeText(searchTerm);

    return productos
      .filter((producto) => {
        if (!term) {
          return true;
        }

        return normalizeText(producto.nombre).includes(term)
          || normalizeText(producto.codigo).includes(term);
      })
      .slice(0, 8);
  }, [productos, searchTerm]);

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
  const cambio = Math.max(0, montoRecibidoNormalizado - total);
  const faltante = Math.max(0, total - montoRecibidoNormalizado);
  const productosCriticos = useMemo(
    () => items.filter((item) => Number(item.stock_disponible) === 2),
    [items],
  );
  const productosSugeridos = useMemo(() => {
    const seleccionados = new Set(items.map((item) => Number(item.producto_id)));

    return productos
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
  }, [items, productos]);
  const resumenVenta = useMemo(() => ({
    items_count: items.reduce((accumulator, item) => accumulator + Number(item.cantidad ?? 0), 0),
    productos_count: items.length,
  }), [items]);

  function updateField(name, value) {
    const nextValue = name === "descuento"
      ? normalizeMoneyInput(value)
      : value;

    setValues((current) => ({
      ...current,
      [name]: nextValue,
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }));

    if (name === "modulo_id") {
      setItems([]);
      setSearchTerm("");
      setMontoRecibido("");
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

  function addProductoBySearch() {
    if (!values.modulo_id) {
      return;
    }

    const term = normalizeText(searchTerm);

    if (!term) {
      return;
    }

    const exactMatch = productos.find((producto) => (
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
    }));
  }

  function formatMontoRecibido() {
    setMontoRecibido((current) => formatMoneyInput(current));
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

  function resetForm(nextValues = createInitialValues()) {
    setValues(nextValues);
    setItems([]);
    setProductos([]);
    setSearchTerm("");
    setMontoRecibido("");
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

    const payload = {
      modulo_id: Number(values.modulo_id),
      fecha_venta: values.fecha_venta,
      descuento: descuento || 0,
      metodo_pago: values.metodo_pago,
      observacion: values.observacion.trim() || null,
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
    cambio,
    faltante,
    productosCriticos,
    productosSugeridos,
    resumenVenta,
    ticketConfig,
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
    applyQuickCash,
    updateTicketField,
    suspendCurrentSale,
    resumeSuspendedSale,
    removeSuspendedSale,
    submit,
  };
}
