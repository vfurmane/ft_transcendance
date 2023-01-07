import { useRouter } from "next/router";
import { useEffect } from "react";
import { LoginForm } from "../components/LoginForm";

export default function Login(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    const access_token = localStorage.getItem("access_token");
    if (access_token !== null) {
      router.replace("/");
    }
  }, [router]);

  return (
    <>
      <LoginForm />
    </>
  );
}
