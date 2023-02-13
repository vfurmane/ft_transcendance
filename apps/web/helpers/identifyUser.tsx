import { useDispatch, useSelector } from "react-redux";
import { Userfront } from "types";
import { selectUserState, setUserState } from "../store/UserSlice";
import { refreshToken } from "./refreshTokens";

async function fetchUser(): Promise<Response | null> {
  return await fetch("/api/user", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  }).catch((error) => null);
}

async function refreshUser() : Promise<Response | null>
{
  let response: Response | null;
  if (await refreshToken()) {
    response = await fetchUser();
    if (!response || !response.ok) return null;
  } else return null;
  return response;
}

export async function identifyUser(loading : boolean): Promise<null | Userfront> {
  let response: Response | null;
  if (loading)
  {
    response = await refreshUser()
  }
  else
  {
    response = await fetchUser();
    if (!response || !response.ok) {
      response = await refreshUser();
    }
  }
  return response !== null ? response.json() as Promise<Userfront> : null;
}
