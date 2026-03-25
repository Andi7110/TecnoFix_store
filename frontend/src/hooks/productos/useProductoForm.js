import { useEffect, useState } from "react";
import {
  createProducto,
  getProducto,
  updateProducto,
} from "../../api/productos";
import {
  buildProductCode,
  buildProductCodePrefix,
  extractProductCodeSequence,
  normalizeProductCodeInput,
} from "../../utils/productCode";
import {
  formatMoneyInput,
  normalizeMoneyInput,
} from "../../utils/currencyInput";
import { useProductoCatalogos } from "./useProductoCatalogos";

const initialForm = {
  modulo_id: "",
  categoria_id: "",
  codigo: "",
  nombre: "",
  descripcion: "",
  foto_url: "",
  precio_compra: "",
  precio_venta: "",
  stock_inicial: "",
  stock_minimo: "2",
  unidad_medida: "unidad",
  estado: true,
  stock: 0,
};

function buildPayload(values, isEdit, codePrefix, codeSequence, fotoFile) {
  const codigo = !isEdit && codePrefix
    ? buildProductCode(codePrefix, codeSequence, { padSequence: true })
    : values.codigo.trim();

  const payload = {
    modulo_id: Number(values.modulo_id),
    categoria_id: Number(values.categoria_id),
    codigo,
    nombre: values.nombre.trim(),
    descripcion: values.descripcion.trim() || null,
    precio_compra: Number(values.precio_compra),
    precio_venta: Number(values.precio_venta),
    stock_minimo: Number(values.stock_minimo),
    unidad_medida: values.unidad_medida.trim(),
  };

  if (fotoFile) {
    payload.foto = fotoFile;
  }

  if (!isEdit) {
    payload.stock_inicial = values.stock_inicial === "" ? 0 : Number(values.stock_inicial);
    payload.estado = Boolean(values.estado);
  }

  return payload;
}

function mapProductoToForm(producto) {
  return {
    modulo_id: String(producto.modulo_id ?? ""),
    categoria_id: String(producto.categoria_id ?? ""),
    codigo: producto.codigo ?? "",
    nombre: producto.nombre ?? "",
    descripcion: producto.descripcion ?? "",
    foto_url: producto.foto_url ?? "",
    precio_compra: producto.precio_compra ?? "",
    precio_venta: producto.precio_venta ?? "",
    stock_inicial: "",
    stock_minimo: String(producto.stock_minimo ?? 0),
    unidad_medida: producto.unidad_medida ?? "unidad",
    estado: Boolean(producto.estado),
    stock: Number(producto.stock ?? 0),
  };
}

export function useProductoForm({ productoId, onSuccess }) {
  const isEdit = Boolean(productoId);
  const [values, setValues] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [validationModal, setValidationModal] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState("");

  const { modulos, categorias, loading: loadingCatalogos, loadingCategorias } =
    useProductoCatalogos(values.modulo_id, true);

  const selectedModulo = modulos.find(
    (modulo) => String(modulo.id) === String(values.modulo_id),
  );
  const selectedCategoria = categorias.find(
    (categoria) => String(categoria.id) === String(values.categoria_id),
  );
  const codePrefix = buildProductCodePrefix(
    selectedModulo?.nombre,
    selectedCategoria?.nombre,
  );
  const codeSequence = extractProductCodeSequence(values.codigo, codePrefix);

  function openValidationModal(title, message) {
    setValidationModal({
      title,
      message,
    });
  }

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    let ignore = false;

    async function loadProducto() {
      setLoading(true);
      setErrorMessage("");

      try {
        const producto = await getProducto(productoId);

        if (!ignore) {
          const mappedProducto = mapProductoToForm(producto);
          setValues(mappedProducto);
          setFotoFile(null);
          setFotoPreview(mappedProducto.foto_url || "");
        }
      } catch {
        if (!ignore) {
          setErrorMessage("No se pudo cargar el producto.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProducto();

    return () => {
      ignore = true;
    };
  }, [isEdit, productoId]);

  function updateFoto(file) {
    setFotoFile(file ?? null);
    setErrors((current) => ({
      ...current,
      foto: undefined,
    }));

    if (!file) {
      setFotoPreview(values.foto_url || "");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFotoPreview(String(reader.result ?? ""));
    };
    reader.readAsDataURL(file);
  }

  function updateField(name, value) {
    const nextValue = name === "codigo" ? normalizeProductCodeInput(value) : value;

    setValues((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === "modulo_id" ? { categoria_id: "", codigo: "" } : {}),
      ...(name === "categoria_id" ? { codigo: "" } : {}),
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }));
  }

  function updateCodeSequence(value) {
    const nextSequence = String(value ?? "")
      .replace(/\D/g, "")
      .slice(0, 3);

    setValues((current) => ({
      ...current,
      codigo: buildProductCode(codePrefix, nextSequence),
    }));

    setErrors((current) => ({
      ...current,
      codigo: undefined,
    }));
  }

  function formatCodeSequence() {
    setValues((current) => {
      const nextSequence = extractProductCodeSequence(current.codigo, codePrefix);

      if (!codePrefix || nextSequence === "") {
        return current;
      }

      return {
        ...current,
        codigo: buildProductCode(codePrefix, nextSequence, { padSequence: true }),
      };
    });
  }

  function updatePriceField(name, value) {
    const nextValue = normalizeMoneyInput(value);

    setValues((current) => ({
      ...current,
      [name]: nextValue,
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }));
  }

  function updateStockInitial(value) {
    const nextValue = String(value ?? "")
      .replace(/\D/g, "")
      .replace(/^0+(?=\d)/, "");

    setValues((current) => ({
      ...current,
      stock_inicial: nextValue,
    }));

    setErrors((current) => ({
      ...current,
      stock_inicial: undefined,
    }));
  }

  function changeStockInitial(delta) {
    setValues((current) => {
      const currentValue = Number(current.stock_inicial || 0);
      const nextValue = Math.max(0, currentValue + delta);

      return {
        ...current,
        stock_inicial: String(nextValue),
      };
    });

    setErrors((current) => ({
      ...current,
      stock_inicial: undefined,
    }));
  }

  function formatPriceField(name) {
    setValues((current) => ({
      ...current,
      [name]: formatMoneyInput(current[name]),
    }));
  }

  async function submit(event) {
    event.preventDefault();

    setSaving(true);
    setErrors({});
    setErrorMessage("");
    setValidationModal(null);

    const precioCompra = Number(values.precio_compra || 0);
    const precioVenta = Number(values.precio_venta || 0);

    if (precioVenta < precioCompra) {
      setErrors({
        precio_venta: [
          "El precio de venta no puede ser menor que el precio de compra.",
        ],
      });
      openValidationModal(
        "Precio de venta invalido",
        "No se puede guardar el producto porque el precio de venta no puede ser menor que el precio de compra.",
      );
      setSaving(false);
      return;
    }

    try {
      const payload = buildPayload(values, isEdit, codePrefix, codeSequence, fotoFile);
      const producto = isEdit
        ? await updateProducto(productoId, payload)
        : await createProducto(payload);

      onSuccess(producto);
    } catch (requestError) {
      const responseStatus = requestError.response?.status;
      const responseMessage =
        requestError.response?.data?.message ??
        requestError.message ??
        "Ocurrio un problema al intentar registrar el producto.";
      const validationErrors = requestError.response?.data?.errors;

      if (validationErrors) {
        setErrors(validationErrors);
        const validationFields = Object.keys(validationErrors);
        const firstField = validationFields[0];
        const firstMessage = validationErrors[firstField]?.[0] ?? "Revisa los datos del formulario.";
        const duplicateCode =
          validationFields.includes("codigo") &&
          /already been taken|ya ha sido tomado|ya existe|registrado|duplicate|duplicado/i.test(
            `${responseMessage} ${firstMessage}`,
          );

        openValidationModal(
          duplicateCode ? "Codigo ya registrado" : "No se pudo guardar el producto",
          duplicateCode
            ? "No se puede registrar el producto porque ese codigo ya esta registrado. Usa un codigo diferente."
            : firstMessage,
        );
      } else if (responseStatus === 422) {
        const duplicateCode = /codigo|already been taken|ya existe|registrado|duplicate|duplicado/i.test(
          responseMessage,
        );

        openValidationModal(
          duplicateCode ? "Codigo ya registrado" : "No se pudo guardar el producto",
          duplicateCode
            ? "No se puede registrar el producto porque ese codigo ya esta registrado. Usa un codigo diferente."
            : responseMessage,
        );
      } else {
        setErrorMessage("No se pudo guardar el producto.");
        openValidationModal(
          "No se pudo guardar el producto",
          "Ocurrio un problema al intentar registrar el producto.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return {
    values,
    errors,
    errorMessage,
    validationModal,
    loading,
    saving,
    modulos,
    categorias,
    loadingCatalogos,
    loadingCategorias,
    isEdit,
    codePrefix,
    codeSequence,
    fotoPreview,
    fixedStockMinimo: 2,
    onChange: updateField,
    onFotoChange: updateFoto,
    onCodeSequenceChange: updateCodeSequence,
    onCodeSequenceBlur: formatCodeSequence,
    onPriceChange: updatePriceField,
    onPriceBlur: formatPriceField,
    onStockInitialChange: updateStockInitial,
    onStockInitialIncrement: () => changeStockInitial(1),
    onStockInitialDecrement: () => changeStockInitial(-1),
    onSubmit: submit,
    updateField,
    updateCodeSequence,
    formatCodeSequence,
    updatePriceField,
    formatPriceField,
    updateStockInitial,
    changeStockInitial,
    submit,
    closeValidationModal: () => setValidationModal(null),
  };
}
