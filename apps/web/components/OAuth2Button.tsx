import { Button } from "./Button";
import type { ReactElement } from "react";

export interface OAuth2ButtonProps {
  children: string;
  clientId: string;
  disabled?: boolean;
  fullWidth?: boolean;
  primary?: boolean;
  redirectUri: string;
  state?: string;
  url: string;
}

export function OAuth2Button(props: OAuth2ButtonProps): ReactElement {
  const generateAuthorizationURL = (state?: string): string =>
    `${props.url}?response_type=code&redirect_uri=${encodeURIComponent(
      props.redirectUri
    )}&client_id=${props.clientId}${state ? `&state=${state}` : ""}`;

  return (
    <Button {...props} href={generateAuthorizationURL(props.state)}>
      {props.children}
    </Button>
  );
}
