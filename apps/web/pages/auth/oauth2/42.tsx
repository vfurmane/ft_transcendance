import { useRouter } from "next/router";
import { useEffect } from "react";

async function exchangeCodeForToken(
  code: string,
  state?: string
): Promise<any> {
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
  console.log(response);
  if (response && response.access_token) return response.access_token;
  return null;
}

export default function FtOauth2(): JSX.Element {
  const router = useRouter();
  useEffect((): void => {
    const code = router.query.code;
    if (!code || typeof code !== "string") {
      // router.push("/login");
      return;
    }
    exchangeCodeForToken(code);
  }, [router]);
  return <></>;
}
