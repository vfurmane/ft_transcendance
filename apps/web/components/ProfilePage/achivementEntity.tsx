import React from "react";
import Image from "next/image";
import Achivement from "../../initType/AchivementInit";
import styles from "styles/entity.module.scss";
import textStyles from "styles/text.module.scss";

export default function AchivementEntity(props: {
  achivement: Achivement;
  key: number;
  handleClick: (e: { achivement: Achivement }) => void;
}): JSX.Element {
  if (typeof props.achivement === "undefined") return <></>;
  return (
    <div className={styles.shadowContainer}>
      <div
        className={`${styles.entityContainer} ${styles.entity}`}
        onClick={(): void =>
          props.handleClick({ achivement: props.achivement })
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
            <h3 className={textStyles.laquer}>{props.achivement.name}</h3>
            <p className={textStyles.saira}> {props.achivement.status}</p>
          </div>
        </div>
      </div>
      <div className={`${styles.entityShadow} d-none d-md-block`}></div>
    </div>
  );
}
