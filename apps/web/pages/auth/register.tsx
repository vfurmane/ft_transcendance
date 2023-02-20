import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Loading } from "../../components/Loading";
import { RegisterForm } from "../../components/RegisterForm";
import styles from "../../styles/register-page.module.scss";

export default function Login(): JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [router]);

  if (loading) return <Loading></Loading>;

  return (
    <div className={styles.container}>
      <RegisterForm />
    </div>
  );
}
