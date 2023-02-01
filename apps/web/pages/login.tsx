import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Loading } from "../components/Loading";
import { LoginForm } from "../components/LoginForm";
import { selectUserState } from "../store/UserSlice";
import styles from "../styles/login-page.module.scss";

export default function Login(): JSX.Element {
  const userState = useSelector(selectUserState);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userState && userState.id && userState.id.length) {
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
