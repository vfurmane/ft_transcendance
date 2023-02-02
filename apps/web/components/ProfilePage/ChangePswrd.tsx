import { useState } from "react";
import { useForm } from "react-hook-form";
import styles from "styles/ChangePswrd.module.scss";
import { Input } from "../Input";
import { useRouter } from "next/router";

interface ChangePasswordFormData {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}

async function changePassword(
  data: ChangePasswordFormData
): Promise<{ message: string } | null> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/change_password`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
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
  if (!response) return null;
  return response;
}

export default function ChangePswrd(): JSX.Element {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ChangePasswordFormData>();

  const onSubmit = async (data: ChangePasswordFormData): Promise<void> => {
    setFormError("");
    setFormSuccess("");
    setLoading(true);

    await changePassword(data)
      .then((response) => {
        if (response === null) {
          throw new Error("An unexpected error occured...");
        } else {
          setFormSuccess(response.message);
          localStorage.removeItem("access_token");
          router.push("/login");
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
        <h3>Change password</h3>
        <Input
          {...register("old_password", {
            required: "'old password' is required",
          })}
          disabled={loading}
          error={errors.old_password}
          placeholder="old password"
          type="password"
          fullWidth
        />
        <Input
          {...register("new_password", {
            required: "'new password' is required",
          })}
          disabled={loading}
          error={errors.new_password}
          placeholder="new password"
          type="password"
          fullWidth
        />
        <Input
          {...register("confirm_new_password", {
            required: "'confirm new password' is required",
          })}
          disabled={loading}
          error={errors.confirm_new_password}
          placeholder="confirm new password"
          type="password"
          fullWidth
        />
        {formError ? <p className={styles.error}>{formError}</p> : null}
        {formSuccess ? <p className={styles.success}>{formSuccess}</p> : null}
        <Input disabled={loading} type="submit" fullWidth primary />
      </form>
    </div>
  );
}
