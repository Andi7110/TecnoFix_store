import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

export function localDateTimeInput(value) {
  const date = value ? dayjs(value) : dayjs();

  return date.isValid() ? date.format("YYYY-MM-DDTHH:mm") : "";
}

export function localDateInput(value) {
  const date = value ? dayjs(value) : dayjs();

  return date.isValid() ? date.format("YYYY-MM-DD") : "";
}

export function displayDateTime(value, fallback = "-") {
  const date = dayjs(value);

  return date.isValid() ? date.format("DD/MM/YYYY HH:mm") : fallback;
}
