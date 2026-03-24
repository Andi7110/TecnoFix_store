function formatDigitsAsMoneyString(digitsOnly) {
  if (digitsOnly === "") {
    return "";
  }

  if (digitsOnly.length <= 2) {
    return digitsOnly;
  }

  const integerPart = digitsOnly.slice(0, -2).replace(/^0+(?=\d)/, "") || "0";
  const decimals = digitsOnly.slice(-2);

  return `${integerPart}.${decimals}`;
}

export function normalizeMoneyInput(value) {
  const rawValue = String(value ?? "");
  const hasExplicitDecimalSeparator = rawValue.includes(".") || rawValue.includes(",");
  const digitsOnly = rawValue.replace(/\D/g, "");

  if (!hasExplicitDecimalSeparator) {
    return formatDigitsAsMoneyString(digitsOnly);
  }

  const normalized = rawValue
    .replace(",", ".")
    .replace(/[^0-9.]/g, "");

  const [integerPart = "", ...decimalParts] = normalized.split(".");
  const decimals = decimalParts.join("").slice(0, 2);

  if (decimalParts.length > 1 || decimalParts.join("").length > 2) {
    return formatDigitsAsMoneyString(digitsOnly);
  }

  if (integerPart === "" && decimals === "") {
    return "";
  }

  return decimals ? `${integerPart || "0"}.${decimals}` : integerPart;
}

export function formatMoneyInput(value) {
  const normalized = normalizeMoneyInput(value);

  if (normalized === "") {
    return "";
  }

  const amount = Number(normalized);

  if (Number.isNaN(amount)) {
    return "";
  }

  return amount.toFixed(2);
}
