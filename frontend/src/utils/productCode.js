export const PRODUCT_CODE_PATTERN = /^[A-Z]{3}-[A-Z]{3}-\d{3}$/;

function normalizeCodeToken(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .trim();
}

export function normalizeProductCodeInput(value) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidProductCode(value) {
  return PRODUCT_CODE_PATTERN.test(normalizeProductCodeInput(value));
}

export function buildProductCodePrefix(moduloNombre, categoriaNombre) {
  const moduloToken = normalizeCodeToken(moduloNombre).replace(/\s+/g, "").slice(0, 3);
  const categoriaToken = normalizeCodeToken(categoriaNombre).replace(/\s+/g, "").slice(0, 3);

  if (moduloToken.length < 3 || categoriaToken.length < 3) {
    return "";
  }

  return `${moduloToken}-${categoriaToken}`;
}

export function buildProductCode(prefix, sequence, options = {}) {
  const { padSequence = false } = options;
  const normalizedPrefix = normalizeProductCodeInput(prefix);
  const normalizedSequence = String(sequence ?? "")
    .replace(/\D/g, "")
    .slice(0, 3);

  if (!normalizedPrefix || !normalizedSequence) {
    return "";
  }

  const finalSequence = padSequence
    ? normalizedSequence.padStart(3, "0")
    : normalizedSequence;

  return `${normalizedPrefix}-${finalSequence}`;
}

export function extractProductCodeSequence(code, prefix = "") {
  const normalizedCode = normalizeProductCodeInput(code);
  const normalizedPrefix = normalizeProductCodeInput(prefix);

  if (!normalizedCode) {
    return "";
  }

  if (normalizedPrefix && normalizedCode.startsWith(`${normalizedPrefix}-`)) {
    return normalizedCode.slice(normalizedPrefix.length + 1).replace(/\D/g, "").slice(0, 3);
  }

  const parts = normalizedCode.split("-");

  return parts.at(-1)?.replace(/\D/g, "").slice(0, 3) ?? "";
}
