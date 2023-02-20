import QRCode from "qrcode";
import { Input } from "../../Input";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "styles/ConfigTfa/CheckTfaToken.module.scss";

export interface ConfigTfaFormData {
  token: string;
}

async function checkTfaToken(data: ConfigTfaFormData): Promise<void | null> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/tfa/check`,
    {
      method: "POST",
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
    }
  });
  if (response === null) return null;
}

export function CheckTfaToken(props: {
  otpAuthUrl: string;
  success: () => unknown;
}): JSX.Element {
  const canvasRef = useRef(null);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ConfigTfaFormData>();

  useEffect(() => {
    QRCode.toCanvas(canvasRef.current, props.otpAuthUrl, (error) => {
      if (error) console.error(error);
    });
  }, [props.otpAuthUrl]);

  const onSubmit = async (data: ConfigTfaFormData): Promise<void> => {
    setFormError("");
    setLoading(true);

    await checkTfaToken(data)
      .then((response) => {
        if (response === null) {
          throw new Error("An unexpected error occured...");
        } else {
          props.success();
        }
      })
      .catch((error) => {
        setFormError(error?.message || "An unexpected error occured...");
        setLoading(false);
      });
  };

  return (
    <>
      <canvas ref={canvasRef} />
      <p>
        Now verify your code by scanning the QR Code above with an OTP
        application (Google Authenticator, Authy, ...)
      </p>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register("token", {
            required: "'token' is required",
          })}
          disabled={loading}
          error={errors.token}
          placeholder="token"
          fullWidth
        />
        {formError ? <p className={styles.error}>{formError}</p> : null}
        <Input disabled={loading} type="submit" fullWidth primary />
      </form>
    </>
  );
}
