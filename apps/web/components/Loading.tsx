import type { ReactElement } from "react";
import styles from "../styles/Loading.module.scss";

export interface LoadingProps {
  children?: ReactElement | string;
}

export function Loading(props: LoadingProps): ReactElement {
  return (
    <div>
      <div className={styles.bar_container}>
        <div className={styles.bouncing_bar}></div>
      </div>
      <p className={styles.description}>{props.children}</p>
    </div>
  );
}
