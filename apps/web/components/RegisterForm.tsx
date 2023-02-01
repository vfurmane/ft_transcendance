import { ReactElement, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../components/Input";
import styles from "styles/RegisterForm.module.scss";
import { useRouter } from "next/router";
import Link from "next/link";

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

interface RegisterUserResponse {
  id: string;
  email: string;
  name: string;
  tfa_setup: boolean;
}

async function registerUser(
  data: RegisterFormData
): Promise<RegisterUserResponse | null> {
  const response = await fetch(`/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...data }),
  }).then(async (response) => {
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

export function RegisterForm(): ReactElement {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    setFormError("");
    setFormSuccess("");
    setLoading(true);

    await registerUser(data)
      .then((response) => {
        console.log(response);
        if (response === null) {
          throw new Error("An unexpected error occured...");
        } else {
          setFormSuccess("Success! Redirecting...");
          localStorage.removeItem("state");
          router.replace("/login");
        }
      })
      .catch((error) => {
        setFormError(error?.message || "An unexpected error occured...");
        setLoading(false);
      });
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <h1>Register</h1>
        <Input
          {...register("username", { required: "'username' is required" })}
          disabled={loading}
          error={errors.username}
          placeholder="username"
          fullWidth
        />
        <Input
          {...register("email", { required: "'email' is required" })}
          disabled={loading}
          error={errors.email}
          placeholder="email"
          type="email"
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
      <p>
        Or <Link href="/login">login</Link>
      </p>
    </div>
  );
}
