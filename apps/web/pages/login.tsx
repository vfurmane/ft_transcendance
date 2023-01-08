import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Loading } from "../components/Loading";
import { LoginForm } from "../components/LoginForm";
import styles from "../styles/login-page.module.scss";

export default function Login(): JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access_token = localStorage.getItem("access_token");
    if (access_token !== null) {
      router.replace("/");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return <Loading></Loading>;

  return (
    <div className={styles.container}>
      <LoginForm />
    </div>
  );
}
