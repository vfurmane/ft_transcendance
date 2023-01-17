import { ReactElement, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../components/Input";
import { TextDivider } from "../components/TextDivider";
import styles from "styles/LoginForm.module.scss";
import crypto from "crypto";
import { FtOAuth2Button } from "./FtOAuth2Button";
import { useRouter } from "next/router";
import { AccessTokenResponse, TfaNeededResponse } from "types";

interface LoginFormData {
  username: string;
  password: string;
}

function obtainState(): string {
  let state = localStorage.getItem("state");
  if (state !== null) return state;
  state = crypto.randomBytes(32).toString("hex");
  localStorage.setItem("state", state);
  return state;
}

async function login(
  data: LoginFormData,
  state: string
): Promise<AccessTokenResponse | TfaNeededResponse | null> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data, state }),
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
  if (!response) return null;
  return response;
}

export function LoginForm(): ReactElement {
  const router = useRouter();
  const [state, setState] = useState("");
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

    await login(data, state)
      .then((response) => {
        if (response === null) {
          throw new Error("An unexpected error occured...");
        } else {
          if ("access_token" in response && response.access_token) {
            setFormSuccess("Success! Redirecting...");
            localStorage.setItem("access_token", response.access_token);
            localStorage.removeItem("state");
            router.replace("/");
          } else if (
            "message" in response &&
            response.message === "Authentication factor needed"
          ) {
            router.replace(`/auth/${response.route}`);
          }
        }
      })
      .catch((error) => {
        setFormError(error?.message || "An unexpected error occured...");
        setLoading(false);
      });
  };

  useEffect(() => {
    setState(obtainState());
  }, []);

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <h1>Login</h1>
        <Input
          {...register("username", { required: "'username' is required" })}
          autofocus
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
      <FtOAuth2Button disabled={loading} state={state} fullWidth />
    </div>
  );
}
