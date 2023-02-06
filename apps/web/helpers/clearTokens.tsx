export function clearTokens() {
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("access_token");
}
