import { useEffect, useState } from "react";
import {
  getAuthenticatedUser,
  login as loginRequest,
  logout as logoutRequest,
} from "../api/auth";
import { AuthContext } from "./authContext";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function bootstrap() {
      try {
        const authenticatedUser = await getAuthenticatedUser();

        if (!ignore) {
          setUser(authenticatedUser);
        }
      } catch (error) {
        if (!ignore && error?.response?.status !== 401) {
          console.error(error);
        }

        if (!ignore) {
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      ignore = true;
    };
  }, []);

  async function login(credentials) {
    const authenticatedUser = await loginRequest(credentials);
    setUser(authenticatedUser);

    return authenticatedUser;
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }

  async function refreshUser() {
    const authenticatedUser = await getAuthenticatedUser();
    setUser(authenticatedUser);

    return authenticatedUser;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
