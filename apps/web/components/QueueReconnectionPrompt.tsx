import type { ReactElement } from "react";
import { useSelector } from "react-redux";
import styles from "styles/QueueReconnectionPrompt.module.scss";
import { selectMatchmakingState } from "../store/MatchmakingSlice";
import { Button } from "./Button";
import { useWebsocketContext } from "./Websocket";

export interface QueueReconnectionPromptProps {
  onReconnection: () => unknown;
}

export function QueueReconnectionPrompt(
  props: QueueReconnectionPromptProps
): ReactElement {
  const MatchmakingState = useSelector(selectMatchmakingState);
  const websockets = useWebsocketContext();

  const reconnectToQueueOnClick = () => {
    return () => {
      if (websockets.matchmaking) {
        websockets.matchmaking.emit("join_queue", {
          game_mode: MatchmakingState.gameMode,
        });
        props.onReconnection();
      }
    };
  };
  return (
    <div className={styles.container}>
      <p>You have been removed from the queue.</p>
      <Button danger onClick={reconnectToQueueOnClick()}>
        Join
      </Button>
    </div>
  );
}
