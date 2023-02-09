import React from "react";
import styles from "styles/playButton.module.scss";
import textStyle from "styles/text.module.scss";
import Router from "next/router";
import { useRouter } from "next/router";
import { useWebsocketContext } from "../Websocket";


export default function PlayMenu(): JSX.Element {
  const router = useRouter();
  const websockets = useWebsocketContext();

  function battleRoyalClick()
  {
    console.log("CLICKING THE BUTTON");
    if (!websockets.pong?.connected) {
      console.error("Pong socket error, abort play game");
      return;
    }

    websockets.pong.emit("searchGame", (response: string) => {
      console.log(response);
    });

    websockets.pong.on("startGame", (config) => {
      console.log("RECEIVED START GAME");
      websockets.pong?.off("startGame");
      router.replace(
        {
          pathname: "/pingPong",
          query: {
            number_player: config.number_player,
            position: config.position,
          },
        },
        "/Pong"
      );
      console.log("number of player :" + config.number_player);
      console.log("position :", config.position);
    });
  }

  return (
    <div>
      <div className={`${styles.playMenuEntity} ${styles.bar}`}>
        <h3 className={textStyle.laquer}>Training</h3>
        <p className={textStyle.saira}>
          Play against a wall to practice aiming the ball.
        </p>
      </div>
      <div className={styles.playMenuEntity} onClick={() => battleRoyalClick()}>
        <h3 className={textStyle.laquer}>Battle royale</h3>
        <p className={textStyle.saira}>
          Play against 100 other players. Be the last one, be the best one!
        </p>
      </div>
    </div>
  );
}
