import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styles from "styles/matchmaking-page.module.scss";
import { GameStartPayload } from "types";
import { Loading } from "../components/Loading";
import { QueueReconnectionPrompt } from "../components/QueueReconnectionPrompt";
import { useWebsocketContext } from "../components/Websocket";
import { selectMatchmakingState } from "../store/MatchmakingSlice";
import { selectUserState } from "../store/UserSlice";

export default function Matchmaking(): ReactElement {
  const [hasLeftQueue, setHasLeftQueue] = useState(false);
  const [loading, setLoading] = useState(true);
  const websockets = useWebsocketContext();
  const router = useRouter();
  const UserState = useSelector(selectUserState);
  const MatchmakingState = useSelector(selectMatchmakingState);

  useEffect(() => {
    if (!MatchmakingState.isInQueue) router.push("/");
    else setLoading(false);
  }, [MatchmakingState.isInQueue, router]);

  useEffect(() => {
    if (websockets.matchmaking) {
      websockets.matchmaking.on("game_start", (data: GameStartPayload) => {
        if (data.users.find((user) => user.id == UserState.id)) {
          router.push("/pingPong");
        }
      });
    }

    return () => {
      if (websockets.matchmaking) {
        websockets.matchmaking.off("game_start");
        websockets.matchmaking.emit("leave_queue");
        setHasLeftQueue(true);
      }
    };
  }, [websockets.matchmaking, UserState.id, router]);

  if (loading) return <Loading></Loading>;

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
