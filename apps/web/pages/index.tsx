import { useRouter } from "next/router";
import { useEffect } from "react";
import Home from "./home";

export default function Web(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    const access_token = localStorage.getItem("access_token");
    if (access_token === null) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div>
      <Home />
    </div>
  );
}
