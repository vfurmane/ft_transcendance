import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AccessTokenResponse, TfaNeededResponse } from "types";
import { Loading } from "../../../components/Loading";

async function exchangeCodeForToken(
  code: string,
  state?: string
): Promise<AccessTokenResponse | TfaNeededResponse | null> {
  const response = await fetch(
<<<<<<< HEAD
    `${
      process.env.NEXT_PUBLIC_API_BASE_URL
    }/auth/login/oauth2/42?${new URLSearchParams({
=======
    `/api/auth/login/oauth2/42?${new URLSearchParams({
>>>>>>> origin/pong-back
      code,
      state: `${state}`,
    })}`
  ).then(async (response) => {
    if (!response.ok) {
      return response.json().then((error) => {
        throw new Error(error.message || "An unexpected error occured...");
      });
    } else {
      return response.json();
    }
  });
  if (!response) return null;
  return response;
}

export default function FtOauth2(): JSX.Element {
  const router = useRouter();
  const [message, setMessage] = useState("Loading...");
  useEffect((): void => {
    if (!router.isReady) return;

    const code = router.query.code;
    const state = router.query.state;
    if (
      !(code && typeof code == "string" && state && typeof state == "string")
    ) {
      router.replace("/login");
      return;
    }
    exchangeCodeForToken(code, state)
      .then((response) => {
        if (response === null) {
          throw new Error("An unexpected error occured...");
        } else {
          if ("access_token" in response && response.access_token) {
            setMessage("Success! Redirecting...");
            localStorage.setItem("access_token", response.access_token);
            localStorage.removeItem("state");
            router.replace("/");
          } else if (
            "message" in response &&
            response.message === "Authentication factor needed"
          ) {
            router.replace(`/auth/${response.route}`);
          }
        }
      })
      .catch((error) => {
        setMessage(error?.message || "An unexpected error occured...");
        router.replace("/login");
      });
  }, [router]);
  return <Loading>{message}</Loading>;
}
