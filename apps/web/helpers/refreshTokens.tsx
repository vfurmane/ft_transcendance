import { useDispatch, useSelector } from "react-redux";
import { Userfront } from "types";
import { selectUserState, setUserState } from "../store/UserSlice";

export async function refreshToken(): Promise<boolean> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh_token: localStorage.getItem("refresh_token"),
    }),
  }).catch((error) => null);
  if (!response || !response.ok) {
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token");
    return false;
  }
  await response.json().then((tokens) => {
    localStorage.setItem("refresh_token", tokens.refresh_token);
    localStorage.setItem("access_token", tokens.access_token);
  });
  return true;
}
