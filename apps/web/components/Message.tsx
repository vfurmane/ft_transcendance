import { Conversation, InvitationEnum, Message as MessageEntity } from "types";
import styles from "styles/Message.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { selectUserState } from "../store/UserSlice";
import { useEffect, useRef, useState } from "react";
import { useWebsocketContext } from "./Websocket";
import { connected } from "process";
import { selectBlockedUsersState, setBlockedUsers } from "../store/BlockedUsersSlice";
import { Button } from "./Button";
import { setInvitedUser } from "../store/InvitationSlice";
import { useRouter } from "next/router";
import { initUser } from "../initType/UserInit";

interface MessageProps {
  message: MessageEntity;
  group: boolean;
}

export default function Message(props: MessageProps): JSX.Element {
  const userState = useSelector(selectUserState);
  const [requirePassword, setRequirePassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [ isBlocked, setIsBlocked ] = useState(false)
  const BlockedUsersState = useSelector(selectBlockedUsersState);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const websockets = useWebsocketContext();
  const selfMessage = useRef(props.message.sender && props.message.sender.id !== userState.id)

  useEffect(() =>
  {
    if (props.group && props.message.sender && BlockedUsersState.includes(props.message.sender.id))
      setIsBlocked(true)
    else if (props.group && props.message.sender && !BlockedUsersState.includes(props.message.sender.id))
      setIsBlocked(false)
  }, [BlockedUsersState])

  if (props.message.system_generated) {
    if (!props.message.is_invitation)
      return (
        <section className={styles.containerSystemMessage}>
          <p className={styles.messageContent}>{props.message.content}</p>
        </section>
      );
    if (props.message.invitation_type === InvitationEnum.CONVERSATION) {
      return (
        <article
          className={`${selfMessage.current ? styles.otherInvitationMessage : styles.invitationMessage} ${styles.messageContent}`}
        >
          <p>
            You are invited to join the conversation {props.message.content}
            </p>
            {!requirePassword && selfMessage.current ? (
              <button
                className={ styles.joinButton }
                onClick={(e) => {
                  setError("");
                  setSuccess("");
                  if (!websockets.conversations?.connected) {
                    setError("Connection error, please try again later");
                    return;
                  }

                  const payload = { id: props.message.target };
                  websockets.conversations.emit(
                    "canJoinConversation",
                    payload,
                    (ret: { canJoin: boolean; password: boolean }) => {
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
                JOIN
              </button>
            ) : (
              <>
                <form className={ styles.invitationForm }
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
                          setError(
                            "Could not join conversation, check password"
                          );
                          return;
                        }
                        setSuccess(
                          `Successfully joined ${props.message.content}`
                        );
                        setRequirePassword(false);
                      }
                    );
                  }}
                >
                  <input
                  className={ styles.passwordField }
                    type="password"
                    placeholder="Enter password"
                    name="password"
                    ref={passwordRef}
                  />
                  <input className={ styles.joinButton } type="submit" value="JOIN" />
                </form>
              </>
            )}
            <div ref={feedbackRef}>
              {error.length ? <div className={ styles.error }>{error}</div> : <></>}
              {success.length ?<div className={ styles.success }>{success}</div> : <></>}
            </div>
          
        </article>
      );
    } else {
      return <article
      className={`${selfMessage.current ? styles.otherInvitationMessage : styles.invitationMessage} ${styles.messageContent}`}
    > <p>Invitation to play Pong</p>
      {props.message.sender?.id !== userState.id ? (
        <Button
          primary
          onClick={(): void => {
            if (!props.message.sender) return;
            websockets.pong?.emit(
              "invite",
              {
                id: props.message.sender.id,
              },
              () => {
                if (!props.message.sender) return;
                dispatch(
                  setInvitedUser({
                    ...initUser,
                    name: props.message.sender.name,
                  })
                );
                router.push("/invite");
              }
            );
          }}
        >
          Click to join
        </Button>
      ) : null};</article>
    }
  } else if (props.message.sender && props.message.sender.id !== userState.id) {
    if (isBlocked)
    {
      return (
        <article className={styles.containerOtherMessageBlocked} onClick={() => {setIsBlocked(false)}}>
            <p>&lt;Blocked user content, click to unveil&gt;</p>
        </article>
      );
    }
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
