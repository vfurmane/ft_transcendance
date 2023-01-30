import React from "react";
import { FieldError } from "react-hook-form";
import styles from "styles/Input.module.scss";

export interface InputProps {
  autofocus?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  primary?: boolean;
  type?: string;

  // React Hook Form error
  error?: FieldError;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    return (
      <div className={styles.container}>
        <input
          autoComplete="off"
          autoFocus={props.autofocus}
          className={`${styles.input} ${
            props.fullWidth ? styles.fullWidth : ""
          } ${props.primary ? styles.primary : ""} ${
            props.error ? styles.error : ""
          }`}
          disabled={props.disabled}
          placeholder={props.placeholder}
          ref={ref}
          type={props.type || "text"}
          onChange={props.onChange}
          onBlur={props.onBlur}
          name={props.name}
        />
        {props.error && <p className={styles.error}>{props.error.message}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
