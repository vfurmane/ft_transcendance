import type { ReactElement } from "react";
import styles from "styles/Button.module.scss";

export interface ButtonProps {
  children: string;
  fullWidth?: boolean;
  href?: string;
  primary?: boolean;
}

export function Button(props: ButtonProps): ReactElement {
  if (props.href)
    return (
      <a
        className={`${styles.container} ${
          props.fullWidth ? styles.fullWidth : ""
        } ${props.primary ? styles.primary : ""}`}
        href={props.href}
      >
        {props.children}
      </a>
    );
  return (
    <button
      className={`${styles.container} ${
        props.fullWidth ? styles.fullWidth : ""
      } ${props.primary ? styles.primary : ""}`}
    >
      {props.children}
    </button>
  );
}
