import { ReactElement, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../components/Input";
import { TextDivider } from "../components/TextDivider";
import styles from "styles/LoginForm.module.scss";
import { FtOAuth2Button } from "./FtOAuth2Button";

interface LoginFormData {
  username: string;
  password: string;
}

async function login(data: LoginFormData): Promise<string | null> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  ).then(async (response) => {
    if (!response.ok) {
      return response.json().then((error) => {
        throw new Error(error.message || "An unexpected error occured...");
      });
    } else {
      return response.json();
    }
  });
  if (response && response.access_token) return response.access_token;
  return null;
}

export function LoginForm(): ReactElement {
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setFormError("");
    setFormSuccess("");
    setLoading(true);

    await login(data)
      .then((accessToken) => {
        if (accessToken === null) {
          throw new Error("An unexpected error occured...");
        } else {
          localStorage.setItem("access_token", accessToken);
          setFormSuccess("Success! Redirecting...");
          return;
        }
      })
      .catch((error) => {
        setFormError(error?.message || "An unexpected error occured...");
      });
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <h1>Login</h1>
        <Input
          {...register("username", { required: "'username' is required" })}
          disabled={loading}
          error={errors.username}
          placeholder="username"
          fullWidth
        />
        <Input
          {...register("password", { required: "'password' is required" })}
          disabled={loading}
          error={errors.password}
          placeholder="password"
          type="password"
          fullWidth
        />
        {formError ? <p className={styles.error}>{formError}</p> : null}
        {formSuccess ? <p className={styles.success}>{formSuccess}</p> : null}
        <Input disabled={loading} type="submit" fullWidth primary />
      </form>
      <TextDivider>or</TextDivider>
      <FtOAuth2Button disabled={loading} fullWidth />
    </div>
  );
}
