import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Loading } from "../../../components/Loading";

async function exchangeCodeForToken(
  code: string,
  state?: string
): Promise<string | null> {
  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_BASE_URL
    }/auth/login/oauth2/42?${new URLSearchParams({
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
  if (response && response.access_token) return response.access_token;
  return null;
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
      .then((accessToken) => {
        if (accessToken) {
          setMessage("Success! Redirecting...");
          localStorage.setItem("access_token", accessToken);
          router.replace("/");
        } else {
          throw new Error("An unexpected error occured...");
        }
      })
      .catch((error) => {
        setMessage(error?.message || "An unexpected error occured...");
        router.replace("/login");
      });
  }, [router]);
  return <Loading>{message}</Loading>;
}
