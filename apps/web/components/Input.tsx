import type { ReactElement } from "react";
import styles from "./Input.module.css";

export interface InputProps {
  fullWidth?: boolean;
  placeholder?: string;
  primary?: boolean;
  type?: string;
}

export function Input(props: InputProps): ReactElement {
  return (
    <input
      className={`${styles.container} ${props.fullWidth && styles.fullWidth} ${
        props.primary && styles.primary
      }`}
      placeholder={props.placeholder}
      type={props.type || "text"}
    />
  );
}
