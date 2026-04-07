import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";
import { getDashboardSummary } from "../../api/dashboard";

const THEME_MODE_KEY = "tecnofix-theme-mode";
const NOTIFICATIONS_READ_KEY = "tecnofix-notifications-read";

function PowerLogo() {
  return (
    <span className="app-power-logo" aria-hidden="true">
      <svg viewBox="0 0 64 64" role="img">
        <circle className="app-power-logo__ring" cx="32" cy="32" r="24" />
        <path
          className="app-power-logo__arc"
          d="M23 22a14 14 0 1 0 18 0"
        />
        <path className="app-power-logo__line" d="M32 18v12" />
      </svg>
    </span>
  );
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 4 7l8 4 8-4-8-4Zm-6 6.5 6 3 6-3V17l-6 3-6-3V9.5Z" />
    </svg>
  );
}

function InventoryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6a2 2 0 0 1 2-2h4v4H3V6Zm0 6h6v8H5a2 2 0 0 1-2-2v-6Zm10-8h6a2 2 0 0 1 2 2v2h-8V4Zm8 8v6a2 2 0 0 1-2 2h-6v-8h8Z" />
    </svg>
  );
}

function RepairsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m21 7.5-4.5 4.5-2-2L19 5.5a5 5 0 0 0-6.5 6.1l-7.8 7.8a2 2 0 1 0 2.8 2.8l7.8-7.8A5 5 0 0 0 21 7.5Z" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18v12H3V6Zm3 2a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h12a2 2 0 0 1 2-2v-4a2 2 0 0 1-2-2H6Zm6 1.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5Z" />
    </svg>
  );
}

function SalesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16v3H4V5Zm0 5h10v9H4v-9Zm12 0h4v9h-4v-9ZM7 13h4v2H7v-2Z" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h9l5 5v13H6V3Zm8 1.5V9h4.5L14 4.5ZM9 12h8v1.8H9V12Zm0 4h8v1.8H9V16Zm0-8h3v1.8H9V8Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.5 4a6.5 6.5 0 1 1 0 13a6.5 6.5 0 0 1 0-13Zm0 1.8a4.7 4.7 0 1 0 0 9.4a4.7 4.7 0 0 0 0-9.4Zm8.87 11.8 1.27 1.27l-1.27 1.27l-3.5-3.5 1.27-1.27 2.23 2.23Z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 18.918a6 6 0 0 0 8 0c0 1.105-1.79 2-4 2s-4-.895-4-2Zm4-15.5a4.5 4.5 0 0 0-4.5 4.5c0 1.098-.5 6-2.5 7.5h14c-2-1.5-2.5-6.402-2.5-7.5a4.5 4.5 0 0 0-4.5-4.5Z" />
    </svg>
  );
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function formatShortDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function buildNotificationItems(summary) {
  const items = [];

  if (Number(summary?.today?.productos_stock_bajo ?? 0) > 0) {
    items.push({
      id: "stock",
      title: "Stock critico detectado",
      body: `${summary.today.productos_stock_bajo} productos necesitan reposicion.`,
      to: "/productos/inventario",
      tone: "warning",
    });
  }

  if (Number(summary?.today?.reparaciones_pendientes ?? 0) > 0) {
    items.push({
      id: "repairs",
      title: "Reparaciones pendientes",
      body: `${summary.today.reparaciones_pendientes} equipos siguen en cola de trabajo.`,
      to: "/reparaciones",
      tone: "accent",
    });
  }

  if (Number(summary?.resumen_dia?.modulos_con_ventas ?? 0) === 0) {
    items.push({
      id: "sales",
      title: "Sin ventas registradas hoy",
      body: "Conviene revisar si la operacion comercial ya inicio correctamente.",
      to: "/ventas",
      tone: "neutral",
    });
  }

  if (Number(summary?.today?.total_salidas ?? 0) > Number(summary?.today?.total_entradas ?? 0)) {
    items.push({
      id: "cash",
      title: "Caja en revision",
      body: "Las salidas del dia superan las entradas registradas.",
      to: "/caja",
      tone: "warning",
    });
  }

  if (items.length === 0) {
    items.push({
      id: "healthy",
      title: "Operacion estable",
      body: "No se detectaron alertas criticas con la informacion actual.",
      to: "/",
      tone: "success",
    });
  }

  return items;
}

function getPageMeta(pathname) {
  if (pathname === "/") {
    return {
      title: "Dashboard",
      description: "Supervisa operacion, ventas, caja y taller desde un solo lugar.",
    };
  }

  if (pathname.startsWith("/ventas/reportes")) {
    return {
      title: "Reportes",
      description: "Analisis comercial y contable con foco en cierres y rendimiento.",
    };
  }

  if (pathname.startsWith("/ventas")) {
    return {
      title: "Ventas",
      description: "Administra caja, historial y detalle de ventas del negocio.",
    };
  }

  if (pathname.startsWith("/reparaciones")) {
    return {
      title: "Reparaciones",
      description: "Controla ingreso, diagnostico y seguimiento de equipos.",
    };
  }

  if (pathname.startsWith("/caja")) {
    return {
      title: "Caja",
      description: "Registra entradas, salidas y balance operativo diario.",
    };
  }

  if (pathname.startsWith("/productos/inventario")) {
    return {
      title: "Inventario",
      description: "Consulta existencias, stock critico y movimiento operativo.",
    };
  }

  if (pathname.startsWith("/productos")) {
    return {
      title: "Productos",
      description: "Gestiona catalogo, precios, estado y surtido comercial.",
    };
  }

  return {
    title: "TecnoFix",
    description: "Operacion comercial centralizada.",
  };
}

function AppLayout() {
  const { logout, user } = useAuth();
  const { pathname } = useLocation();
  const pageMeta = getPageMeta(pathname);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(THEME_MODE_KEY) === "dark";
  });
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isTopbarVisible, setIsTopbarVisible] = useState(true);
  const [notificationsSummary, setNotificationsSummary] = useState(null);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState("");
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = window.localStorage.getItem(NOTIFICATIONS_READ_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const mode = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", mode);
    window.localStorage.setItem(THEME_MODE_KEY, mode);
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(NOTIFICATIONS_READ_KEY, JSON.stringify(readNotificationIds));
  }, [readNotificationIds]);

  useEffect(() => {
    if (!isUserMenuOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!userMenuRef.current?.contains(event.target)) {
        setIsUserMenuOpen(false);
      }

      if (!notificationsRef.current?.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isUserMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    let lastScrollY = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollY;
      const nearTop = currentScrollY < 32;

      setIsTopbarVisible(scrollingUp || nearTop);
      lastScrollY = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadNotifications() {
      if (!ignore) {
        setNotificationsLoading(true);
        setNotificationsError("");
      }

      try {
        const data = await getDashboardSummary();

        if (!ignore) {
          setNotificationsSummary(data);
        }
      } catch {
        if (!ignore) {
          setNotificationsError("No se pudieron cargar las notificaciones.");
        }
      } finally {
        if (!ignore) {
          setNotificationsLoading(false);
        }
      }
    }

    loadNotifications();

    const intervalId = window.setInterval(loadNotifications, 60000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const notificationItems = useMemo(
    () => buildNotificationItems(notificationsSummary),
    [notificationsSummary],
  );

  const notificationCount = useMemo(
    () =>
      notificationItems.filter(
        (item) => item.id !== "healthy" && !readNotificationIds.includes(item.id),
      ).length,
    [notificationItems, readNotificationIds],
  );

  const recentNotificationActivity = useMemo(
    () => notificationsSummary?.actividad_reciente?.slice(0, 2) ?? [],
    [notificationsSummary],
  );

  function markNotificationsAsRead(ids) {
    if (!ids.length) {
      return;
    }

    setReadNotificationIds((current) => [...new Set([...current, ...ids])]);
  }

  const navItems = [
    { to: "/", label: "Dashboard", end: true, icon: <DashboardIcon /> },
    {
      to: "/productos",
      label: "Productos",
      icon: <ProductsIcon />,
      children: [{ to: "/productos/inventario", label: "Inventario", icon: <InventoryIcon /> }],
    },
    {
      to: "/ventas",
      label: "Ventas",
      icon: <SalesIcon />,
      children: [
        { to: "/ventas/reportes", label: "Reportes", icon: <ReportsIcon /> },
      ],
    },
    { to: "/reparaciones", label: "Reparaciones", icon: <RepairsIcon /> },
    { to: "/caja", label: "Caja", icon: <CashIcon /> },
  ];

  async function handleConfirmLogout() {
    setIsLoggingOut(true);
    setIsUserMenuOpen(false);

    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setIsLogoutConfirmOpen(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar is-pinned">
        <div className="app-sidebar__inner">
          <div className="app-sidebar__brand">
            <PowerLogo />
            <div className="app-sidebar__brand-copy">
              <span className="app-sidebar__brand-name">TecnoFix</span>
              <span className="app-sidebar__brand-text">Sistema comercial</span>
            </div>
          </div>

          <nav className="app-nav">
            {navItems.map((item) => {
              const groupSelected = pathname.startsWith(item.to);

              return (
                <div key={item.to} className="app-nav__group">
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `app-nav__link ${isActive ? "is-active" : ""}`
                    }
                    title={item.label}
                  >
                    <span className="app-nav__icon">{item.icon}</span>
                    <span className="app-nav__label app-nav__label--visible">{item.label}</span>
                  </NavLink>

                  {item.children && groupSelected ? (
                    <div className="app-nav__sublinks">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={({ isActive }) =>
                            `app-nav__sublink ${isActive ? "is-active" : ""}`
                          }
                          title={child.label}
                        >
                          <span className="app-nav__sublink-icon">{child.icon}</span>
                          <span>{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

        </div>
      </aside>

      <div className="app-content">
        <div className="app-toolbar">
          <div className={`app-topbar ${isTopbarVisible ? "is-visible" : "is-hidden"}`}>
            <div className="app-topbar__left">
              <label className="app-topbar__search" aria-label="Busqueda global">
                <span className="app-topbar__search-icon">
                  <SearchIcon />
                </span>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Buscar productos, ventas o reparaciones..."
                />
              </label>
            </div>

            <div className="app-topbar__right">
              <div className="app-topbar__status-item">
                <strong>{pageMeta.title}</strong>
              </div>

              <div
                ref={notificationsRef}
                className={`app-notifications ${isNotificationsOpen ? "is-open" : ""}`}
              >
                <button
                  type="button"
                  className="btn app-topbar__alerts"
                  title="Alertas del sistema"
                  aria-haspopup="menu"
                  aria-expanded={isNotificationsOpen}
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsNotificationsOpen((current) => {
                      const nextOpen = !current;

                      if (nextOpen) {
                        markNotificationsAsRead(
                          notificationItems
                            .filter((item) => item.id !== "healthy")
                            .map((item) => item.id),
                        );
                      }

                      return nextOpen;
                    });
                  }}
                >
                  <BellIcon />
                  {notificationCount > 0 ? (
                    <span className="app-topbar__alerts-badge">{notificationCount}</span>
                  ) : null}
                </button>

                {isNotificationsOpen ? (
                  <div className="app-notifications__panel" role="menu">
                    <div className="app-notifications__header">
                      <div>
                        <p className="app-user-menu__kicker">Alertas</p>
                        <strong>Centro de notificaciones</strong>
                      </div>
                      <button
                        type="button"
                        className="app-notifications__refresh"
                        onClick={async () => {
                          setNotificationsLoading(true);
                          setNotificationsError("");

                          try {
                            const data = await getDashboardSummary();
                            setNotificationsSummary(data);
                          } catch {
                            setNotificationsError("No se pudieron actualizar las notificaciones.");
                          } finally {
                            setNotificationsLoading(false);
                          }
                        }}
                      >
                        Actualizar
                      </button>
                    </div>

                    {notificationsError ? (
                      <p className="app-notifications__empty">{notificationsError}</p>
                    ) : notificationsLoading ? (
                      <p className="app-notifications__empty">Cargando notificaciones...</p>
                    ) : (
                      <>
                        <div className="app-notifications__list">
                          {notificationItems.map((item) => (
                            <Link
                              key={item.id}
                              to={item.to}
                              className={`app-notifications__item app-notifications__item--${item.tone}`}
                              onClick={() => {
                                markNotificationsAsRead([item.id]);
                                setIsNotificationsOpen(false);
                              }}
                            >
                              <div>
                                <strong>{item.title}</strong>
                                <p>{item.body}</p>
                              </div>
                            </Link>
                          ))}
                        </div>

                        <div className="app-notifications__activity">
                          <div className="app-notifications__activity-header">
                            <strong>Actividad reciente</strong>
                          </div>

                          {recentNotificationActivity.length > 0 ? (
                            recentNotificationActivity.map((item) => (
                              <div key={`${item.tipo}-${item.entidad_id}`} className="app-notifications__activity-item">
                                <strong>{item.titulo}</strong>
                                <span>{item.contexto}</span>
                                <small>
                                  {formatMoney(item.monto)} · {formatShortDateTime(item.fecha)}
                                </small>
                              </div>
                            ))
                          ) : (
                            <p className="app-notifications__empty">No hay actividad reciente para mostrar.</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                className={`app-theme-switch ${isDarkMode ? "is-active" : ""}`}
                onClick={() => setIsDarkMode((current) => !current)}
                role="switch"
                aria-checked={isDarkMode}
                title="Cambiar modo oscuro"
              >
                <span className="app-theme-switch__track">
                  <span className="app-theme-switch__thumb" />
                </span>
                <span className="app-theme-switch__label">
                  {isDarkMode ? "Modo oscuro" : "Modo claro"}
                </span>
              </button>

              <div
                ref={userMenuRef}
                className={`app-user-menu ${isUserMenuOpen ? "is-open" : ""}`}
              >
                <button
                  type="button"
                  className="btn app-user-menu__trigger"
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    setIsUserMenuOpen((current) => !current);
                  }}
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                  aria-label="Abrir menu de usuario"
                >
                  <span className="app-user-menu__avatar">
                    <PowerLogo />
                  </span>
                </button>
                <p className="app-user-menu__display-name">{user?.name ?? "Usuario"}</p>

                {isUserMenuOpen ? (
                  <div className="app-user-menu__dropdown" role="menu">
                    <div className="app-user-menu__header">
                      <p className="app-user-menu__kicker">Sesion activa</p>
                      <p className="app-user-menu__name">{user?.name ?? "Usuario"}</p>
                      <p className="app-user-menu__email">{user?.email ?? ""}</p>
                    </div>

                    <button type="button" className="app-user-menu__item" role="menuitem">
                      Mi perfil
                    </button>

                    <button
                      type="button"
                      className="app-user-menu__item"
                      onClick={() => {
                        setIsDarkMode((current) => !current);
                        setIsUserMenuOpen(false);
                      }}
                      role="menuitem"
                    >
                      {isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    </button>

                    <button type="button" className="app-user-menu__item" role="menuitem">
                      Preferencias
                    </button>

                    <button
                      type="button"
                      className="app-user-menu__item app-user-menu__item--danger"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsLogoutConfirmOpen(true);
                      }}
                      role="menuitem"
                    >
                      Cerrar sesion
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <main className="app-main">
          <Outlet />
        </main>
      </div>

      {isLogoutConfirmOpen ? (
        <div
          className="app-confirm-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar cierre de sesion"
          onClick={() => !isLoggingOut && setIsLogoutConfirmOpen(false)}
        >
          <div
            className="app-confirm-modal__card"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Confirmar cierre de sesion</h3>
            <p className="muted-text mb-3">¿Estas seguro que deseas cerrar sesion?</p>
            <div className="app-confirm-modal__actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setIsLogoutConfirmOpen(false)}
                disabled={isLoggingOut}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Cerrando..." : "Si, cerrar sesion"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AppLayout;
