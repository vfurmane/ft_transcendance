import { useState } from "react";
import { useForm } from "react-hook-form";
import styles from "styles/ChangeUsername.module.scss";
import { Input } from "../Input";
import { useRouter } from "next/router";
import { setUserName } from "../../store/UserSlice";
import { useDispatch } from "react-redux";

interface ChangeUsernameFormData {
  new_username: string;
}

async function changeUsername(
  data: ChangeUsernameFormData
): Promise<{ message: string } | null> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/name`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials:"same-origin",
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

export default function ChangeUsername(): JSX.Element {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ChangeUsernameFormData>();

  const onSubmit = async (data: ChangeUsernameFormData): Promise<void> => {
    setFormError("");
    setFormSuccess("");
    setLoading(true);

    await changeUsername(data)
      .then((response) => {
        if (response === null) {
          throw new Error("An unexpected error occured...");
        } else {
          setFormSuccess(response.message);
          dispatch(setUserName(data.new_username));
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
        <h3>Change username</h3>
        <Input
          {...register("new_username", {
            required: "'new username' is required",
          })}
          disabled={loading}
          error={errors.new_username}
          placeholder="new username"
          fullWidth
        />
        {formError ? <p className={styles.error}>{formError}</p> : null}
        {formSuccess ? <p className={styles.success}>{formSuccess}</p> : null}
        <Input disabled={loading} type="submit" fullWidth primary />
      </form>
    </div>
  );
}
