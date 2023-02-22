import { Conversation, InvitationEnum, Message as MessageEntity } from "types";
import styles from "styles/Message.module.scss";
import { useSelector } from "react-redux";
import { selectUserState } from "../store/UserSlice";
import { useRef, useState } from "react";
import { useWebsocketContext } from "./Websocket";
import { connected } from "process";

interface MessageProps {
  message: MessageEntity;
  group: boolean;
}

export default function Message(props: MessageProps): JSX.Element {
  const userState = useSelector(selectUserState);
  const [requirePassword, setRequirePassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const feedbackRef = useRef<HTMLElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const websockets = useWebsocketContext();

  if (props.message.system_generated) {
    if (!props.message.is_invitation)
      return (
        <section
          className={styles.containerSystemMessage}
        >
          <p className={styles.messageContent}>{props.message.content}</p>
        </section>
      );
    return (
      <>
        <article
          className={`${styles.invitationMessage} ${styles.messageContent}`}
        >
          {props.message.invitation_type === InvitationEnum.CONVERSATION ? (
            <p>
              You are invited to join {props.message.content}, click{" "}
              <span
                onClick={(e) => {
                  setError("");
                  setSuccess("");
                  if (!websockets.conversations?.connected) {
                    setError("Connection error, please try again later");
                    return;
                  }

                  const payload = { id: props.message.target };
                  console.error("target: ", payload);
                  websockets.conversations.emit(
                    "canJoinConversation",
                    payload,
                    (ret: { canJoin: boolean; password: boolean }) => {
                      console.error("canJoin: ", ret);
                      if (ret.canJoin === false) {
                        setError(
                          "Cannot join this conversation, please verify you are not already in it or ask the invitor"
                        );
                        return;
                      }
                      if (!ret.password) {
                        websockets.conversations?.emit(
                          "joinConversation",
                          { id: props.message.target },
                          () => {
                            setSuccess("Successfully joined conversation");
                            return;
                          }
                        );
                      } else {
                        setRequirePassword(true);
                        return;
                      }
                    }
                  );
                }}
              >
                here to join
              </span>
            </p>
          ) : (
            <p>Invitation to play Pong</p>
          )}
        </article>
        {requirePassword ? (
          <>
            <article>Please enter password: </article>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setError("");
                if (!websockets.conversations?.connected) {
                  setError("Connection error, please try again later");
                  return;
                }
                websockets.conversations.timeout(1000).emit(
                  "joinConversation",
                  {
                    id: props.message.target,
                    password: passwordRef.current?.value,
                  },
                  (err: any, conversation: Conversation) => {
                    if (err) {
                      setError("Could not join conversation, check password");
                      return;
                    }
                    setSuccess(`Successfully joined ${props.message.content}`);
                    setRequirePassword(false);
                  }
                );
              }}
            >
              <input
                type="password"
                placeholder="Enter password"
                name="password"
                ref={passwordRef}
              />
              <input type="submit" value="submit" />
            </form>
          </>
        ) : (
          <></>
        )}
        <article ref={feedbackRef}>
          {error.length ? error : <></>}
          {success.length ? success : <></>}
        </article>
      </>
    );
  } else if (props.message.sender && props.message.sender.id !== userState.id) {
    return (
      <article className={styles.containerOtherMessage}>
        {props.group ? (
          <p className={styles.senderName}>{props.message.sender?.name}</p>
        ) : (
          <></>
        )}
        <p className={styles.messageContent}>{props.message.content}</p>
      </article>
    );
  } else {
    return (
      <article className={styles.containerSelfMessage}>
        <p className={styles.messageContent}>{props.message.content}</p>
      </article>
    );
  }
}
