import type { ReactElement } from "react";
import styles from "styles/Button.module.scss";

export interface ButtonProps {
  children: string;
  fullWidth?: boolean;
  primary?: boolean;
}

export function Button(props: ButtonProps): ReactElement {
  return (
    <button
      className={`${styles.container} ${props.fullWidth && styles.fullWidth} ${
        props.primary && styles.primary
      }`}
    >
      {props.children}
    </button>
  );
}
