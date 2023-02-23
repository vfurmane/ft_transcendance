import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AccessTokenResponse, TfaNeededResponse } from "types";
import { Loading } from "../../../components/Loading";
import { identifyUser } from "../../../helpers/identifyUser";
import { setUserState } from "../../../store/UserSlice";

async function exchangeCodeForToken(
  code: string,
  state?: string
): Promise<boolean | TfaNeededResponse> {
  const response = await fetch(
    `/api/auth/login/oauth2/42?${new URLSearchParams({
      code,
      state: `${state}`,
    })}`
  ).then(async (response) => {
    if (!response.ok) {
      return response.json().then((error) => {
        throw new Error(error.message || "An unexpected error occured...");
      });
    } else if (response.status < 400) {
      return await response.text().then((data) => {
        return data ? JSON.parse(data) : {};
      });
    }
  });
  if (!response) return false;
  else if (!Object.keys(response).length) return true;
  return response;
}

export default function FtOauth2(): JSX.Element {
  const router = useRouter();
  const [message, setMessage] = useState("Loading...");
  const dispatch = useDispatch();

  useEffect((): void => {
    if (!router.isReady) return;

    const code = router.query.code;
    const state = router.query.state;
    if (
      !(code && typeof code == "string" && state && typeof state == "string")
    ) {
      router.replace("/auth/login");
      return;
    }
    exchangeCodeForToken(code, state)
      .then(async (response) => {
        if (response === false) {
          throw new Error("An unexpected error occured...");
        } else if (response === true) {
          setMessage("Success! Redirecting...");
          localStorage.removeItem("state");
          const user = await identifyUser(false);
          if (user) {
            dispatch(setUserState(user));
            router.replace(`/profile/${user.name}`);
          } else {
            router.replace('/')
          }
        } else if (
          "message" in response &&
          response.message === "Authentication factor needed"
        ) {
          router.replace(`/auth/${response.route}`);
        }
      })
      .catch((error) => {
        setMessage(error?.message || "An unexpected error occured...");
        router.replace("/auth/login");
      });
  }, [router]);
  return <Loading>{message}</Loading>;
}
