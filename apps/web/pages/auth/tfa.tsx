import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Loading } from "../../components/Loading";
import { TfaForm } from "../../components/TfaForm";
import styles from "../../styles/auth-tfa-page.module.scss";

export default function Tfa(): JSX.Element {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState("");

  useEffect(() => {
    if (accessToken) {
      router.replace("/");
      localStorage.removeItem("state");
      return;
    }

    const localState = localStorage.getItem("state");
    if (localState === null) {
      router.replace("/auth/login");
      return;
    }

    setState(localState);
    setLoading(false);
  }, [accessToken, state, router]);

  if (loading) return <Loading></Loading>;

  return (
    <div className={styles.container}>
      <TfaForm setAccessToken={setAccessToken} state={state} />
    </div>
  );
}
