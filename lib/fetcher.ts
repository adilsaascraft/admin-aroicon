// lib/fetcher.ts
import { fetchWithAuth } from "./fetchWithAuth"
export const fetcher = async (url: string) => {
  const res = await fetchWithAuth(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}
