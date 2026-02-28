import { createContext, useEffect, useMemo, useState } from "react";
import { loadAuthSession, saveAuthSession } from "./authStorage.js";
import { apiRequest } from "../../../shared/api/httpClient.js";

const AuthContext = createContext(null);

function normalizeUser(rawUser) {
  if (!rawUser || typeof rawUser !== "object") {
    return null;
  }

  if (
    typeof rawUser.id !== "string" ||
    typeof rawUser.name !== "string" ||
    typeof rawUser.role !== "string"
  ) {
    return null;
  }

  return {
    id: rawUser.id,
    name: rawUser.name,
    email: typeof rawUser.email === "string" ? rawUser.email : "",
    role: rawUser.role,
    isActive: rawUser.isActive !== false,
  };
}

function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadAuthSession());
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasHydratedSession, setHasHydratedSession] = useState(false);

  useEffect(() => {
    if (hasHydratedSession) {
      return;
    }

    let isMounted = true;

    async function hydrateSession() {
      if (!session?.token) {
        if (isMounted) {
          setIsInitializing(false);
        }
        return;
      }

      try {
        const response = await apiRequest("/auth/me", {
          method: "GET",
          token: session.token,
        });

        const normalizedUser = normalizeUser(response.data);

        if (!normalizedUser) {
          throw new Error("Invalid user payload.");
        }

        const nextSession = {
          token: session.token,
          user: normalizedUser,
        };

        if (isMounted) {
          setSession(nextSession);
          saveAuthSession(nextSession);
        }
      } catch {
        if (isMounted) {
          setSession(null);
          saveAuthSession(null);
        }
      } finally {
        if (isMounted) {
          setHasHydratedSession(true);
          setIsInitializing(false);
        }
      }
    }

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, [hasHydratedSession, session?.token]);

  const value = useMemo(() => {
    const register = async (payload) => {
      try {
        const response = await apiRequest("/auth/register", {
          method: "POST",
          body: {
            name: payload?.name,
            email: payload?.email,
            password: payload?.password,
          },
        });

        return {
          ok: true,
          user: normalizeUser(response.data?.user),
        };
      } catch (error) {
        return {
          ok: false,
          error: error?.message || "Registration failed.",
        };
      }
    };

    const signIn = async (payload) => {
      try {
        const response = await apiRequest("/auth/login", {
          method: "POST",
          body: {
            email: payload?.email,
            password: payload?.password,
          },
        });

        const normalizedUser = normalizeUser(response.data?.user);
        const token = response.data?.token;

        if (!normalizedUser || typeof token !== "string" || !token) {
          throw new Error("Invalid authentication response.");
        }

        const nextSession = {
          token,
          user: normalizedUser,
        };

        setSession(nextSession);
        saveAuthSession(nextSession);

        return { ok: true, user: normalizedUser };
      } catch (error) {
        return {
          ok: false,
          error: error?.message || "Login failed.",
        };
      }
    };

    const signOut = () => {
      setSession(null);
      saveAuthSession(null);
    };

    return {
      session,
      accessToken: session?.token ?? null,
      currentUser: session?.user ?? null,
      isAuthenticated: Boolean(session),
      isInitializing,
      currentUserId: session?.user?.id ?? null,
      currentRole: session?.user?.role ?? null,
      currentUserName: session?.user?.name ?? null,
      register,
      signIn,
      signOut,
    };
  }, [isInitializing, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
