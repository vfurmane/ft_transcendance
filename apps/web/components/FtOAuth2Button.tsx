import { OAuth2Button } from "./OAuth2Button";
import type { ReactElement } from "react";

export interface FtOAuth2ButtonProps {
  disabled?: boolean;
  fullWidth?: boolean;
  state?: string;
}

export function FtOAuth2Button(props: FtOAuth2ButtonProps): ReactElement {
  return (
    <OAuth2Button
      {...props}
      clientId={`${process.env.NEXT_PUBLIC_FT_OAUTH2_CLIENT_ID}`}
      redirectUri={`${process.env.NEXT_PUBLIC_BASE_URL}/auth/oauth2/42`}
      url="https://api.intra.42.fr/oauth/authorize"
    >
      Sign in with 42
    </OAuth2Button>
  );
}
