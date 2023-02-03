import { LoginForm } from "../components/LoginForm";
import styles from "../styles/login-page.module.scss";

export default function Login(): JSX.Element {
  return (
    <div className={styles.container}>
      <LoginForm />
    </div>
  );
}
