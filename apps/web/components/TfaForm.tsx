import { Dispatch, ReactElement, SetStateAction, useState } from "react";
import { Input } from "./Input";
import styles from "../styles/TfaForm.module.scss";
import { useForm } from "react-hook-form";
import { identifyUser } from "../helpers/identifyUser";
import { setUserState } from "../store/UserSlice";
import { useDispatch } from "react-redux";
import { AccessTokenResponse } from "types";

export interface TfaFormProps {
  setAccessToken: Dispatch<SetStateAction<string>>;
  state: string;
}

export interface TfaFormData {
  token: string;
}

async function checkTfa(
  data: TfaFormData,
  state: string
): Promise<AccessTokenResponse | null> {
  const response = await fetch(`/api/auth/login/tfa`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...data, state }),
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

export function TfaForm(props: TfaFormProps): ReactElement {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<TfaFormData>();
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const onSubmit = async (data: TfaFormData): Promise<void> => {
    setLoading(true);
    setFormError("");
    setFormSuccess("");

    await checkTfa(data, props.state)
      .then(async (response) => {
        if (response === null) {
          throw new Error("An unexpected error occured...");
        } else {
          setFormSuccess("Success! Redirecting...");
          props.setAccessToken(response.access_token);
          localStorage.setItem("access_token", response.access_token);
          localStorage.setItem("refresh_token", response.refresh_token);
          localStorage.removeItem("state");
          const user = await identifyUser(false);
          if (user) dispatch(setUserState(user));
          localStorage.removeItem("state");
          return;
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
        <h1>OTP verification</h1>
        <p>Open your authentication app and type in your OTP.</p>
        <Input
          {...register("token", { required: "'token' is required" })}
          autofocus
          disabled={loading}
          error={errors.token}
          placeholder="token"
          fullWidth
        />
        {formError ? <p className={styles.error}>{formError}</p> : null}
        {formSuccess ? <p className={styles.success}>{formSuccess}</p> : null}
        <Input disabled={loading} type="submit" fullWidth primary />
      </form>
    </div>
  );
}
