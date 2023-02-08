import React from "react";
import styles from "styles/playButton.module.scss";

export default function PlayButton(props: {
  handleClick: () => void;
  open: boolean;
  style : {text: string, small: boolean, color: boolean};
}): JSX.Element {
  return (
    <div className={styles.PlayButtonContainer}>
      <button
        className={`${styles.playButton} ${props.style.small? styles.small : ''} ${!props.style.color? styles.noColor : ''} `}
        type="button"
        onClick={(): void => props.handleClick()}
      >
        {props.style.text}
      </button>
    </div>
  );
}
