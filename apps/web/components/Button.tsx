import type { ReactElement } from "react";
import styles from "styles/Button.module.scss";

export interface ButtonProps {
  children: string;
  danger?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  href?: string;
  onClick?: () => unknown;
  primary?: boolean;
}

export function Button(props: ButtonProps): ReactElement {
  if (props.href && !props.disabled)
    return (
      <a
        className={`${styles.container} ${
          props.fullWidth ? styles.fullWidth : ""
        } ${props.danger ? styles.danger : ""} ${
          props.primary ? styles.primary : ""
        }`}
        href={props.href}
        onClick={props.onClick}
      >
        {props.children}
      </a>
    );
  return (
    <button
      className={`${styles.container} ${
        props.fullWidth ? styles.fullWidth : ""
      } ${props.danger ? styles.danger : ""} ${
        props.primary ? styles.primary : ""
      }`}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
