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
    if (websockets.pong) {
      console.log("Im not yet ready for game_start at ", Date.now());
      websockets.pong.on("game_start", (data: GameStartPayload) => {
        console.log("received a game_start from server");
        if (data.users.find((user) => user.id == UserState.id)) {
          console.log("game_start was for me, im rerouting !");
          router.push(`/pingPong/${data.id}`);
        }
      });
    }

    return () => {
      if (websockets.pong) {
        websockets.pong.off("game_start");
        websockets.pong.emit("leave_queue");
        setHasLeftQueue(true);
      }
    };
  }, [websockets.pong, UserState.id, router]);

  if (loading) return <Loading></Loading>;

  function launch() {
    console.log('sending launch')
    websockets.pong?.emit('launch')
  }

  return (
    <div className={styles.container}>
      <h1>Waiting for an opponent...</h1>
      <button onClick={launch}>LAUNCH</button>
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
