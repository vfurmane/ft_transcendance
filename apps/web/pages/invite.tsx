import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GameStartPayload } from "types";
import { useWebsocketContext } from "../components/Websocket";
import {
  selectInvitationState,
  setInvitedUser,
} from "../store/InvitationSlice";
import { selectUserState } from "../store/UserSlice";
import styles from "styles/invite-page.module.scss";
import { Button } from "../components/Button";
import { initUser } from "../initType/UserInit";

export default function Invite(): ReactElement {
  const UserState = useSelector(selectUserState);
  const dispatch = useDispatch();
  const router = useRouter();
  const websockets = useWebsocketContext();
  const InvitationState = useSelector(selectInvitationState);

  useEffect(() => {
    if (websockets.pong) {
      websockets.pong.on("game_start", (data: GameStartPayload) => {
        if (data.users.find((user) => user.id == UserState.id)) {
          dispatch(setInvitedUser(initUser));
          router.push(`/pingPong/${data.id}`);
        }
      });

      websockets.pong.emit("invite", {
        id: InvitationState.user.id,
      });
    }

    return () => {
      if (websockets.pong) {
        websockets.pong.emit("discard", () => {
          console.log("discarded");
        });
        websockets.pong.off("game_start");
      }
    };
  }, [router, UserState.id, websockets.pong, InvitationState]);

  return (
    <div className={styles.container}>
      <h1>Waiting for {InvitationState.user.name}</h1>
      <Button href="/" danger>
        Go back
      </Button>
    </div>
  );
}
