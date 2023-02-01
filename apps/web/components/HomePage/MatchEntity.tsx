import React from "react";
import Image from "next/image";
import textStyle from "styles/text.module.scss";
import styles from "styles/entity.module.scss";
import { Match } from "../../initType/MatchInit";
import User from "../../initType/UserInit";

export default function MatchEntity(props: {
  match: Match;
  user: User;
  key: number;
}): JSX.Element {
  if (!props || !props.match) return <></>;

  return (
    <div className={styles.shadowContainer}>
      <div
        className={`${styles.entityContainer} ${styles.entity} ${styles.big}`}
      >
        <div className={`${styles.entityContainer} ${styles.start}`}>
          <div className="fill small">
            <Image
              alt="avatar"
              src={`/avatar/avatar-${
                props.match.winner
                  ? props.match.winner.avatar_num
                  : props.user.avatar_num
              }.png`}
              width={47}
              height={47}
            />
          </div>
          <div className={styles.entityText}>
            <h3 className={textStyle.laquer}>
              {props.match.winner ? props.match.winner.name : props.user.name}
            </h3>
            <p className={textStyle.saira} style={{ textAlign: "center" }}>
              {props.match.score_winner}
            </p>
          </div>
        </div>
        <span>VS</span>
        <div className={`${styles.entityContainer} ${styles.end}`}>
          <div className={styles.entityText}>
            <h3 className={textStyle.laquer}>
              {props.match.looser !== null
                ? props.match.looser.name
                : props.user.name}
            </h3>
            <p className={textStyle.saira} style={{ textAlign: "center" }}>
              {props.match.score_looser}
            </p>
          </div>
          <div className="fill small">
            <Image
              alt="avatar"
              src={`/avatar/avatar-${
                props.match.looser
                  ? props.match.looser.avatar_num
                  : props.user.avatar_num
              }.png`}
              width={47}
              height={47}
            />
          </div>
        </div>
      </div>
      <div
        className={`${styles.entityShadow} ${styles.big} d-none d-sm-block`}
      ></div>
    </div>
  );
}
