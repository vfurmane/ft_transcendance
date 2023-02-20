import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useEffect } from "react";
import { useSelector } from "react-redux";
import { GameStartPayload } from "types";
import { useWebsocketContext } from "../components/Websocket";
import { selectInvitationState } from "../store/InvitationSlice";
import { selectUserState } from "../store/UserSlice";
import styles from "styles/invite-page.module.scss";
import { Button } from "../components/Button";

export default function Invite(): ReactElement {
  const UserState = useSelector(selectUserState);
  const router = useRouter();
  const websockets = useWebsocketContext();
  const InvitationState = useSelector(selectInvitationState);

  useEffect(() => {
    if (websockets.pong) {
      websockets.pong.on("game_start", (data: GameStartPayload) => {
        console.log("received a game_start from server");
        if (data.users.find((user) => user.id == UserState.id)) {
          router.push(`/pingPong/${data.id}`);
        }
      });
    }

    return () => {
      if (websockets.pong) {
        websockets.pong.emit("discard", () => {
          console.log("discarded");
        });
      }
    };
  }, [router, UserState.id, websockets.pong]);

  return (
    <div className={styles.container}>
      <h1>Waiting for {InvitationState.user.name}</h1>
      <Button href="/" danger>
        Go back
      </Button>
    </div>
  );
}
