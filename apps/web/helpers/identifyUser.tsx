import { useDispatch, useSelector } from "react-redux";
import { Userfront } from "types";
import { selectUserState, setUserState } from "../store/UserSlice";
import { refreshToken } from "./refreshTokens";

async function fetchUser(): Promise<Response | null> {
  return await fetch("/api/user", {
    credentials: "same-origin",
  }).catch((error) => null);
}

export async function identifyUser(): Promise<null | Userfront> {
  let response = await fetchUser();
  if (!response || !response.ok) {
    if (await refreshToken()) {
      response = await fetchUser();
      if (!response || !response.ok) return null;
    } else return null;
  }
  return response.json() as Promise<Userfront>;
}
