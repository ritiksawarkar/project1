const AUTH_STORAGE_KEY = "social-mentor-auth-v1";

function isBrowserEnvironment() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function parseAuthSession(value) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);

    if (
      typeof parsed?.token === "string" &&
      parsed.token.length > 0 &&
      typeof parsed?.user?.id === "string" &&
      parsed.user.id.length > 0 &&
      typeof parsed?.user?.name === "string" &&
      parsed.user.name.length > 0 &&
      typeof parsed?.user?.role === "string" &&
      parsed.user.role.length > 0
    ) {
      return {
        token: parsed.token,
        user: {
          id: parsed.user.id,
          name: parsed.user.name,
          email:
            typeof parsed.user.email === "string" ? parsed.user.email : "",
          role: parsed.user.role,
          isActive: parsed.user.isActive !== false,
        },
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function loadAuthSession() {
  if (!isBrowserEnvironment()) {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return parseAuthSession(rawSession);
  } catch {
    return null;
  }
}

export function saveAuthSession(session) {
  if (!isBrowserEnvironment()) {
    return;
  }

  if (!session) {
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore storage removal failures.
    }
    return;
  }

  const sanitizedSession = {
    token: session.token,
    user: {
      id: session.user?.id,
      name: session.user?.name,
      email: session.user?.email,
      role: session.user?.role,
      isActive: session.user?.isActive,
    },
  };

  try {
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify(sanitizedSession),
    );
  } catch {
    // Ignore storage write failures.
  }
}
