import { Button } from "../../Button";
import { Dispatch, SetStateAction } from "react";

async function setupTfa(): Promise<{ otpauth_url: string } | null> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/tfa`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
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
  if (response === null) return null;
  return response;
}

export function SetupTfa(props: {
  setOtpauthUrl: Dispatch<SetStateAction<string | null>>;
}): JSX.Element {
  const setupTfaClick = async (): Promise<void> => {
    await setupTfa()
      .then((response) => {
        if (response === null) {
          throw new Error("An unexpected error occured...");
        } else {
          props.setOtpauthUrl(response.otpauth_url);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return <Button onClick={setupTfaClick}>Setup TFA</Button>;
}
