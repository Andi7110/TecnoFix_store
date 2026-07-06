export const ACCESS_MODULES = [
  { value: "dashboard", label: "Inicio" },
  { value: "inventario", label: "Productos e inventario" },
  { value: "ventas", label: "Ventas y reportes" },
  { value: "reparaciones", label: "Reparaciones y reportes" },
  { value: "caja", label: "Caja" },
  { value: "costos", label: "Costos y rentabilidad" },
  { value: "bitacora", label: "Bitacora" },
  { value: "usuarios", label: "Usuarios" },
];

export const USER_ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "vendedor", label: "Vendedor" },
  { value: "tecnico", label: "Tecnico" },
];

export function canAccessModule(user, module) {
  if (!user) {
    return false;
  }

  if (user.is_admin || user.role === "admin") {
    return true;
  }

  return Array.isArray(user.allowed_modules) && user.allowed_modules.includes(module);
}

export function getDefaultPathForUser(user) {
  const orderedModules = [
    ["dashboard", "/"],
    ["ventas", "/ventas"],
    ["reparaciones", "/reparaciones"],
    ["inventario", "/productos"],
    ["caja", "/caja"],
    ["costos", "/costos"],
    ["bitacora", "/bitacora"],
    ["usuarios", "/usuarios"],
  ];

  return orderedModules.find(([module]) => canAccessModule(user, module))?.[1] ?? "/login";
}
