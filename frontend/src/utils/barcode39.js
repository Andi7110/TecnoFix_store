const CODE39_PATTERNS = {
  "0": "nnnwwnwnn",
  "1": "wnnwnnnnw",
  "2": "nnwwnnnnw",
  "3": "wnwwnnnnn",
  "4": "nnnwwnnnw",
  "5": "wnnwwnnnn",
  "6": "nnwwwnnnn",
  "7": "nnnwnnwnw",
  "8": "wnnwnnwnn",
  "9": "nnwwnnwnn",
  A: "wnnnnwnnw",
  B: "nnwnnwnnw",
  C: "wnwnnwnnn",
  D: "nnnnwwnnw",
  E: "wnnnwwnnn",
  F: "nnwnwwnnn",
  G: "nnnnnwwnw",
  H: "wnnnnwwnn",
  I: "nnwnnwwnn",
  J: "nnnnwwwnn",
  K: "wnnnnnnww",
  L: "nnwnnnnww",
  M: "wnwnnnnwn",
  N: "nnnnwnnww",
  O: "wnnnwnnwn",
  P: "nnwnwnnwn",
  Q: "nnnnnnwww",
  R: "wnnnnnwwn",
  S: "nnwnnnwwn",
  T: "nnnnwnwwn",
  U: "wwnnnnnnw",
  V: "nwwnnnnnw",
  W: "wwwnnnnnn",
  X: "nwnnwnnnw",
  Y: "wwnnwnnnn",
  Z: "nwwnwnnnn",
  "-": "nwnnnnwnw",
  ".": "wwnnnnwnn",
  " ": "nwwnnnwnn",
  $: "nwnwnwnnn",
  "/": "nwnwnnnwn",
  "+": "nwnnnwnwn",
  "%": "nnnwnwnwn",
  "*": "nwnnwnwnn",
};

const CODE39_ALLOWED = /^[0-9A-Z.\- $/+%]+$/;

export function sanitizeCode39Value(value) {
  const normalized = String(value ?? "").trim().toUpperCase();

  if (!normalized) {
    throw new Error("El producto no tiene codigo para generar el codigo de barra.");
  }

  if (!CODE39_ALLOWED.test(normalized)) {
    throw new Error(`El codigo "${normalized}" contiene caracteres no compatibles con Code 39.`);
  }

  return normalized;
}

export function buildCode39Svg(value, options = {}) {
  const encodedValue = `*${sanitizeCode39Value(value)}*`;
  const narrowWidth = Number(options.narrowWidth ?? 2);
  const wideWidth = Number(options.wideWidth ?? 5);
  const height = Number(options.height ?? 64);
  const quietZone = Number(options.quietZone ?? 12);
  const interCharacterGap = Number(options.interCharacterGap ?? narrowWidth);

  let x = quietZone;
  const bars = [];

  for (let charIndex = 0; charIndex < encodedValue.length; charIndex += 1) {
    const pattern = CODE39_PATTERNS[encodedValue[charIndex]];

    for (let patternIndex = 0; patternIndex < pattern.length; patternIndex += 1) {
      const unitWidth = pattern[patternIndex] === "w" ? wideWidth : narrowWidth;

      if (patternIndex % 2 === 0) {
        bars.push(`<rect x="${x}" y="0" width="${unitWidth}" height="${height}" rx="0.35" ry="0.35" />`);
      }

      x += unitWidth;
    }

    if (charIndex < encodedValue.length - 1) {
      x += interCharacterGap;
    }
  }

  const totalWidth = x + quietZone;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${height}" role="img" aria-label="Codigo de barras ${encodedValue}">
      <rect width="${totalWidth}" height="${height}" fill="#ffffff" />
      <g fill="#111111">
        ${bars.join("")}
      </g>
    </svg>
  `.trim();
}
