import { useEffect, useMemo, useState } from "react";
import { createVenta } from "../../api/ventas";
import { listProductos } from "../../api/productos";
import { formatMoneyInput, normalizeMoneyInput } from "../../utils/currencyInput";

function getLocalDateTimeValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60000);

  return localDate.toISOString().slice(0, 16);
}

const initialValues = {
  modulo_id: "",
  fecha_venta: getLocalDateTimeValue(),
  descuento: "",
  metodo_pago: "efectivo",
  observacion: "",
};

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function useVentaForm({ onSuccess }) {
  const [values, setValues] = useState(initialValues);
  const [items, setItems] = useState([]);
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

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
  const productosCriticos = useMemo(
    () => items.filter((item) => Number(item.stock_disponible) === 2),
    [items],
  );

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
      onSuccess?.(venta);
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
    productosCriticos,
    updateField,
    formatDiscount,
    setSearchTerm,
    addProducto,
    removeItem,
    updateItem,
    formatItemPrice,
    submit,
  };
}
