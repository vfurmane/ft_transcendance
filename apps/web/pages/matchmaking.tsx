import { ReactElement, useEffect } from "react";
import styles from "styles/matchmaking-page.module.scss";
import { useWebsocketContext } from "../components/Websocket";

export default function Matchmaking(): ReactElement {
  const websockets = useWebsocketContext();

  useEffect(() => {
    return () => {
      if (websockets.matchmaking) {
        websockets.matchmaking.emit("leave_queue");
      }
    };
  }, [websockets.matchmaking]);
  return (
    <div className={styles.container}>
      <h1>Waiting for an opponent...</h1>
    </div>
  );
}
