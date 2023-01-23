import React from "react";
import styles from "styles/playButton.module.scss";

export default function PlayButton(props: {
  handleClick: () => void;
  open: boolean;
}): JSX.Element {
  return (
    <div className={styles.PlayButtonContainer}>
      <button
        className={styles.playButton}
        type="button"
        onClick={(): void => props.handleClick()}
      >
        PLAY
      </button>
      <button className={styles.playButtonShadow} type="button" />
    </div>
  );
}
