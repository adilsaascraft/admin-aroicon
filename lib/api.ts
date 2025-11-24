const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Refresh token function
async function refreshAccessToken() {
  try {
    const res = await fetch(`${BASE_URL}/api/users/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // send refreshToken cookie
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "Refresh failed");

    localStorage.setItem("token", json.accessToken); // update accessToken
    return json.accessToken;
  } catch (err) {
    console.error("Refresh token failed:", err);
    localStorage.removeItem("token");
    return null;
  }
}

/**
 * API helper
 * Automatically attaches accessToken for protected routes
 * and retries once on 401 using refresh token
 */
export async function api(endpoint: string, options: RequestInit = {}) {
  // List of public endpoints that do NOT require a token
  const publicEndpoints = ["/login", "/forgot-password", "/reset-password"];

  let token: string | null = null;

  if (!publicEndpoints.some((path) => endpoint.startsWith(path))) {
    token = localStorage.getItem("token");
  }

  const makeRequest = async () =>
    fetch(`${BASE_URL}/api/users${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      ...options,
    });

  let res = await makeRequest();

  // If access token expired, try refreshing once (only for protected endpoints)
  if (res.status === 401 && token) {
    token = await refreshAccessToken();
    if (token) {
      res = await makeRequest(); // retry original request
    }
  }

  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!res.ok) throw new Error(json?.message || "Request failed");

  return json;
}
