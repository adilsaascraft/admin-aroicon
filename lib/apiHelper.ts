import { fetchWithAuth } from "./fetchWithAuth";

export async function apiRequest<T>(
  url: string,
  method: "POST" | "PUT" | "DELETE",
  body?: any
): Promise<T> {
  const res = await fetchWithAuth(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `${method} request failed`);
  }
  return res.json();
}
