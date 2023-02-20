import React from "react";
import textStyle from "styles/text.module.scss";
import styles from "styles/entity.module.scss";
import { Userfront as User, MatchFront as Match } from "types";
import ProfilePicture from "../ProfilePicture";

export default function MatchEntity(props: {
  match: Match;
  user: User;
}): JSX.Element {
  if (!props || !props.match) return <></>;

  return (
    <div className={styles.shadowContainer}>
      <div
        className={`${styles.entityContainer} ${styles.entity} ${styles.big}`}
      >
        <div className={`${styles.entityContainer} ${styles.start}`}>
          <div className="fill small">
            <ProfilePicture
              userId={
                props.match.winner ? props.match.winner.id : props.user.id
              }
              width={47}
              height={47}
              handleClick={undefined}
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
            <ProfilePicture
              userId={
                props.match.looser ? props.match.looser.id : props.user.id
              }
              width={47}
              height={47}
              handleClick={undefined}
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
