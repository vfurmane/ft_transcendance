import { Button } from "../../Button";

export interface ManageTfaProps {
  success: () => void;
}

async function deleteTfa(): Promise<void | null> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/tfa`,
    {
      method: "DELETE",
      credentials:"same-origin",
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

export function ManageTfa(props: ManageTfaProps): JSX.Element {
  const deleteTfaClick = async (): Promise<void> => {
    await deleteTfa()
      .then((response) => {
        if (response === null) {
          throw new Error("An unexpected error occured...");
        } else {
          props.success();
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      <p>TFA is configured on your account !</p>
      <Button onClick={deleteTfaClick} danger>
        Remove TFA
      </Button>
    </>
  );
}
