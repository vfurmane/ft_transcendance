import React from "react";
import Image from "next/image";
import { Achievements } from "types";
import styles from "styles/entity.module.scss";
import textStyles from "styles/text.module.scss";

export default function AchivementEntity(props: {
  achievement: Achievements;
  key: number;
  handleClick: (e: { achievement: Achievements }) => void;
}): JSX.Element {
  if (typeof props.achievement === "undefined") return <></>;
  return (
    <div className={styles.shadowContainer}>
      <div
        className={`${styles.entityContainer} ${styles.entity}`}
        onClick={(): void =>
          props.handleClick({ achievement: props.achievement })
        }
      >
        <div className={styles.imageText}>
          <Image
            alt="avatar"
            src={`/achivement.png`}
            width={32}
            height={32}
            style={{ marginLeft: "10px" }}
          />
          <div className={styles.entityText}>
            <h3 className={textStyles.laquer}>{props.achievement.title}</h3>
          </div>
        </div>
      </div>
      <div className={`${styles.entityShadow} d-none d-md-block`}></div>
    </div>
  );
}
