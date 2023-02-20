export async function refreshToken(): Promise<boolean> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "same-origin"
  }).catch((error) => null);
  if (!response || !response.ok) {
    return false;
  }
  return true;
}
