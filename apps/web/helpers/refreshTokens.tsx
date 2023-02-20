export async function refreshToken(): Promise<boolean> {
  console.error(`old refresh token: ${localStorage.getItem("refresh_token")}`);
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "same-origin",
  }).catch((error) => null);
  if (!response || !response.ok) {
    return false;
  }
  return true;
}
