import { ReactElement, useEffect, useState } from "react";
import styles from "styles/matchmaking-page.module.scss";
import { QueueReconnectionPrompt } from "../components/QueueReconnectionPrompt";
import { useWebsocketContext } from "../components/Websocket";

export default function Matchmaking(): ReactElement {
  const [hasLeftQueue, setHasLeftQueue] = useState(false);
  const websockets = useWebsocketContext();

  useEffect(() => {
    return () => {
      if (websockets.matchmaking) {
        websockets.matchmaking.emit("leave_queue");
        setHasLeftQueue(true);
      }
    };
  }, [websockets.matchmaking]);
  return (
    <div className={styles.container}>
      <h1>Waiting for an opponent...</h1>
      {hasLeftQueue ? (
        <QueueReconnectionPrompt
          onReconnection={(): void => {
            setHasLeftQueue(false);
          }}
        />
      ) : null}
    </div>
  );
}
