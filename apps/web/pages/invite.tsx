import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useEffect } from "react";
import { useSelector } from "react-redux";
import { GameStartPayload } from "types";
import { useWebsocketContext } from "../components/Websocket";
import { selectUserState } from "../store/UserSlice";

export default function Invite(): ReactElement {
  const UserState = useSelector(selectUserState);
  const router = useRouter();
  const websockets = useWebsocketContext();

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
    <>
      <h1>Invited user</h1>
      <Link href="/">Go back</Link>
    </>
  );
}
