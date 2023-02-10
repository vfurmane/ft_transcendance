import { useRouter } from "next/router";
import React, { MouseEventHandler } from "react";
import { useDispatch } from "react-redux";
import styles from "styles/playButton.module.scss";
import textStyle from "styles/text.module.scss";
import { GameMode } from "types";
import { setGameMode } from "../../store/MatchmakingSlice";
import { useWebsocketContext } from "../Websocket";

export default function PlayMenu(): JSX.Element {
  const websockets = useWebsocketContext();
  const dispatch = useDispatch();
  const router = useRouter();

  const joinQueueOnClick = (
    mode: GameMode
  ): MouseEventHandler<HTMLDivElement> => {
    return () => {
      if (websockets.matchmaking) {
        websockets.matchmaking.emit("join_queue", {
          game_mode: mode,
        });
        dispatch(setGameMode(mode));
        router.push("/matchmaking");
      }
    };
  };

  return (
    <div>
      <div className={`${styles.playMenuEntity} ${styles.bar}`}>
        <h3 className={textStyle.laquer}>Training</h3>
        <p className={textStyle.saira}>
          Play against a wall to practice aiming the ball.
        </p>
      </div>
      <div
        className={`${styles.playMenuEntity} ${styles.bar}`}
        onClick={joinQueueOnClick(GameMode.CLASSIC)}
      >
        <h3 className={textStyle.laquer}>Classic</h3>
        <p className={textStyle.saira}>Play classic Pong game from 1972.</p>
      </div>
      <div
        className={styles.playMenuEntity}
        onClick={joinQueueOnClick(GameMode.BATTLE_ROYALE)}
      >
        <h3 className={textStyle.laquer}>Battle royale</h3>
        <p className={textStyle.saira}>
          Play against 100 other players. Be the last one, be the best one!
        </p>
      </div>
    </div>
  );
}
