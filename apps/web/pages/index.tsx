import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Home from "./home";
import { Loading } from "../components/Loading";

export default function Web(): JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const access_token = localStorage.getItem("access_token");
    if (access_token === null) {
      router.replace("/login");
    } else {
      setLoading(false);
      setAccessToken(accessToken);
    }
  }, [router]);

  if (loading) return <Loading></Loading>;

  return (
    <div>
      <Home/>
    </div>
  );
}
