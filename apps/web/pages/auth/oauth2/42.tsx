import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
  )
    .then((response) => {
      if (!response.ok) throw new Error("HTTP error");
      return response;
    })
    .then((data) => data.json())
    .catch((error) => {
      console.error(error);
      return null;
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
    exchangeCodeForToken(code, state).then((accessToken) => {
      if (accessToken) {
        setMessage("Success! Redirecting...");
        localStorage.setItem("access_token", accessToken);
        router.replace("/");
      } else {
        setMessage("An error occured... Redirecting to the login page...");
        router.replace("/login");
      }
    });
  }, [router]);
  return <>{message}</>;
}
