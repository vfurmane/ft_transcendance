import type { ReactElement } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { TextDivider } from "../components/TextDivider";
import styles from "./LoginForm.module.css";

export function LoginForm(): ReactElement {
  const { handleSubmit, register } = useForm();
  const onSubmit = async (data: any): Promise<void> => {
    console.log(data);
    const accessTokenResponse = await fetch(
      `http://localhost:3000/auth/login`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    )
      .then((response) => {
        if (!response.ok) throw new Error("HTTP error");
        return response;
      })
      .then((data) => data.json())
      .catch((error) => {
        console.error(error);
      });

    if (accessTokenResponse === null) {
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <h1>Login</h1>
        <Input
          {...register("username", { required: true })}
          placeholder="username"
          fullWidth
        />
        <Input
          {...register("password", { required: true })}
          placeholder="password"
          fullWidth
        />
        <Input type="submit" fullWidth primary />
      </form>
      <TextDivider>or</TextDivider>
      <Button fullWidth>Sign in with 42</Button>
    </div>
  );
}
