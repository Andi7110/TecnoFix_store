import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";

const SIDEBAR_PINNED_KEY = "tecnofix-sidebar-pinned";
const THEME_MODE_KEY = "tecnofix-theme-mode";

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

function PinIcon({ pinned }) {
  return pinned ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 3h8v2l-2 3v5l2 2v1H8v-1l2-2V8L8 5V3Zm3 13h2v5h-2v-5Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m16 3 5 5-1.5 1.5-1.7-1.7-2.9 2.9 2.1 5.6-1 1-5.6-2.1-4 4-.7-.7 4-4-2.1-5.6 1-1 5.6 2.1 2.9-2.9L14.5 4.5 16 3Z" />
    </svg>
  );
}

function AppLayout() {
  const { logout, user } = useAuth();
  const { pathname } = useLocation();
  const [isSidebarPinned, setIsSidebarPinned] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(SIDEBAR_PINNED_KEY) === "true";
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(THEME_MODE_KEY) === "dark";
  });
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_PINNED_KEY, String(isSidebarPinned));
  }, [isSidebarPinned]);

  useEffect(() => {
    const mode = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", mode);
    window.localStorage.setItem(THEME_MODE_KEY, mode);
  }, [isDarkMode]);

  useEffect(() => {
    if (!isUserMenuOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!userMenuRef.current?.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isUserMenuOpen]);

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
    <div className={`app-shell ${isSidebarPinned ? "app-shell--sidebar-pinned" : ""}`}>
      <aside className={`app-sidebar ${isSidebarPinned ? "is-pinned" : ""}`}>
        <div className="app-sidebar__inner">
          <div className="app-sidebar__brand">
            <button
              type="button"
              className="btn app-sidebar__pin app-sidebar__pin--top"
              onClick={() => setIsSidebarPinned((current) => !current)}
              title={isSidebarPinned ? "Desfijar menu" : "Fijar menu"}
            >
              <span className="app-sidebar__pin-icon">
                <PinIcon pinned={isSidebarPinned} />
              </span>
              <span className="app-sidebar__pin-label">
                {isSidebarPinned ? "Desfijar menu" : "Fijar menu"}
              </span>
            </button>

            <PowerLogo />

            <p className="app-kicker">Operacion diaria</p>
            <h1 className="app-brand">
              <span className="app-brand__accent">TecnoFix</span>
              <span className="app-brand__text">Sistema comercial</span>
            </h1>
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
                    <span className="app-nav__label">{item.label}</span>
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
          <div className="app-toolbar__actions">
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
                onClick={() => setIsUserMenuOpen((current) => !current)}
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
