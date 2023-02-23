import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction, useState } from "react";
import { Socket } from "socket.io-client";
import {
  Conversation as ConversationEntity,
  conversationRestrictionEnum,
  ConversationRole,
  ConversationRoleEnum,
} from "types";
import ToggleCross from "../public/toggleCross.png";
import { useWebsocketContext } from "./Websocket";
import { Button } from "./Button";
import styles from "../styles/openedConversation.module.scss";
import { useSelector } from "react-redux";
import { selectUserState } from "../store/UserSlice";

interface ConversationParticipantsProps {
  participant: ConversationRole;
  self: ConversationRole | null;
  conversation: ConversationEntity;
  setParticipants: Dispatch<SetStateAction<ConversationRole[]>>
}

export default function ConversationParticipant(
  props: ConversationParticipantsProps
) {
  const websockets = useWebsocketContext();
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const userState = useSelector(selectUserState);
  
  const refreshParticipants = () =>
  {
    websockets.conversations?.emit(
      "getParticipants",
      { id: props.conversation.id },
      (roles: ConversationRole[]) => {
        props.setParticipants(roles)
        })
  }

  const promoteUser = (newRole: ConversationRoleEnum, promote: boolean) => {
    setError("");
    setSuccess("");
    if (!websockets.conversations?.connected) {
      setError("Temporary network error, please try again later");
      return;
    }
    websockets.conversations.timeout(1000).emit(
      "updateRole",
      {
        id: props.conversation.id,
        userId: props.participant.user.id,
        newRole: newRole,
      },
      (err: any, answer: string) => {
        if (err) {
          if (promote)
            setError(
              `Failed to promote ${props.participant.user.name} as ${newRole}`
            );
          else
            setError(
              `Failed to demote ${props.participant.user.name} as ${newRole}`
            );
          return;
        }
        setSuccess(answer);
        setShowOptions(false)
        setTimeout(refreshParticipants, 500)
      }
    );
  };

  if (!props.conversation.groupConversation)
    return (
      <article>
        <Link
          href={`/profile/${props.participant.user.name}`}
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "10px",
            }}
          >
            <Button primary>Profil</Button>
          </div>
        </Link>
      </article>
    );
  if (!showOptions) {
    if (!props.participant.restrictions.length)
      return (
        <section
          onClick={(e) => {
            setShowOptions(true);
          }}
          style={{ display: "flex", justifyContent: "start" }}
        >
          <article style={{ marginLeft: "10px" }}>
            {props.participant.user.name} :
          </article>
          <article style={{ marginLeft: "10px" }}>
            {props.participant.role}
          </article>
        </section>
      );
    return (
      <section
        onClick={(e) => {
          setShowOptions(true);
        }}
        style={{ display: "flex", justifyContent: "start" }}
      >
        <article style={{ marginLeft: "10px" }}>
          {props.participant.user.name} :
        </article>
        <article style={{ marginLeft: "10px" }}>
          {props.participant.role}
        </article>
        <article style={{ marginLeft: "10px" }}>
          {props.participant.restrictions.filter(
            (e) => e.status === conversationRestrictionEnum.BAN
          ).length
            ? "BANNED"
            : "MUTED"}
        </article>
      </section>
    );
  }
  if (
    !props.self?.restrictions.length &&
    (props.self?.role === ConversationRoleEnum.OWNER ||
      (props.self?.role === ConversationRoleEnum.ADMIN &&
        props.participant.role === ConversationRoleEnum.USER))
  ) {
    return (
      <section
        style={{
          border: "solid 1px white",
          borderRadius: "20px",
          width: "60%",
          marginLeft: "20%",
          marginBottom: "20px",
          position: "relative",
        }}
      >
        <article
          onClick={() => {
            setShowOptions(false);
          }}
          className={styles.cross}
        >
          <Image src={ToggleCross} alt="toggle bar" width={10} height={10} />
        </article>
        <article>
          {props.participant.user.name}
          <Link
            href={`/profile/${props.participant.user.name}`}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10px",
                width: "60%",
                marginLeft: "20%",
              }}
            >
              <Button primary fullWidth>
                Profil
              </Button>
            </div>
          </Link>
        </article>
        <article>Role: {props.participant.role}</article>
        <article
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "60%",
            marginLeft: "20%",
          }}
        >
          {!props.participant.restrictions.filter(
            (e) => e.status === conversationRestrictionEnum.MUTE
          ).length ? (
            <div style={{ marginBottom: "5px" }}>
              <Button
                fullWidth
                onClick={() => {
                  setError("");
                  setSuccess("");
                  if (!websockets.conversations?.connected) {
                    setError("Temporary network error, please try again later");
                    return;
                  }
                  websockets.conversations.timeout(1000).emit(
                    "muteUser",
                    {
                      id: props.conversation.id,
                      username: props.participant.user.name,
                      date: new Date(
                        new Date().getTime() + 24 * 60 * 60 * 1000
                      ),
                    },
                    (err: any, answer: string) => {
                      if (err) {
                        setError("Failed to mute user");
                        return;
                      }
                      setSuccess(answer);
                      setShowOptions(false)
                      setTimeout(refreshParticipants, 500)
                    }
                  );
                }}
              >
                Mute for 24h
              </Button>
            </div>
          ) : (
            <div style={{ marginBottom: "5px" }}>
              <Button
                onClick={() => {
                  setError("");
                  setSuccess("");
                  if (!websockets.conversations?.connected) {
                    setError("Temporary network error, please try again later");
                    return;
                  }
                  websockets.conversations.timeout(1000).emit(
                    "unmuteUser",
                    {
                      id: props.conversation.id,
                      username: props.participant.user.name,
                    },
                    (err: any, answer: string) => {
                      if (err) {
                        setError("Failed to unmute user");
                        return;
                      }
                      setSuccess(
                        `Sucessfully unmuted ${props.participant.user.name}`
                      );
                      setShowOptions(false)
                      setTimeout(refreshParticipants, 500)
                    }
                  );
                }}
              >
                Unmute
              </Button>
            </div>
          )}
          {!props.participant.restrictions.filter(
            (e) => e.status === conversationRestrictionEnum.BAN
          ).length ? (
            <>
              <div style={{ marginBottom: "5px" }}>
                <Button
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    if (!websockets.conversations?.connected) {
                      setError(
                        "Temporary network error, please try again later"
                      );
                      return;
                    }
                    websockets.conversations.timeout(1000).emit(
                      "banUser",
                      {
                        id: props.conversation.id,
                        username: props.participant.user.name,
                        date: new Date(
                          new Date().getTime() + 24 * 60 * 60 * 1000
                        ),
                      },
                      (err: any, answer: string) => {
                        if (err) {
                          setError("Failed to ban user");
                          return;
                        }
                        setSuccess(answer);
                        setShowOptions(false)
                        setTimeout(refreshParticipants, 500)
                      }
                    );
                  }}
                >
                  Ban for 24h
                </Button>
              </div>
              <div style={{ marginBottom: "5px" }}>
                <Button
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    if (!websockets.conversations?.connected) {
                      setError(
                        "Temporary network error, please try again later"
                      );
                      return;
                    }
                    websockets.conversations.timeout(1000).emit(
                      "banUserIndefinitely",
                      {
                        id: props.conversation.id,
                        username: props.participant.user.name,
                      },
                      (err: any, answer: string) => {
                        if (err) {
                          setError("Failed to ban user");
                          return;
                        }
                        setSuccess(answer);
                        setShowOptions(false)
                        setTimeout(refreshParticipants, 500)
                      }
                    );
                  }}
                >
                  Ban indefinitely
                </Button>
              </div>
            </>
          ) : (
            <div style={{ marginBottom: "5px" }}>
              <Button
                fullWidth
                onClick={() => {
                  setError("");
                  setSuccess("");
                  if (!websockets.conversations?.connected) {
                    setError("Temporary network error, please try again later");
                    return;
                  }
                  websockets.conversations.timeout(1000).emit(
                    "unbanUser",
                    {
                      id: props.conversation.id,
                      username: props.participant.user.name,
                    },
                    (err: any, answer: string) => {
                      if (err) {
                        setError("Failed to unban user");
                        return;
                      }
                      setSuccess(
                        `Sucessfully unbanned ${props.participant.user.name}`
                      );
                      setShowOptions(false)
                      setTimeout(refreshParticipants, 500)
                    }
                  );
                }}
              >
                Unban
              </Button>
            </div>
          )}
          <div style={{ marginBottom: "5px", width: "100%" }}>
            <Button
              fullWidth
              onClick={() => {
                setError("");
                setSuccess("");
                if (!websockets.conversations?.connected) {
                  setError("Temporary network error, please try again later");
                  return;
                }
                websockets.conversations.timeout(1000).emit(
                  "kickUser",
                  {
                    id: props.conversation.id,
                    username: props.participant.user.name,
                  },
                  (err: any, answer: string) => {
                    if (err) {
                      setError("Failed to kick user");
                      return;
                    }
                    setSuccess(
                      `${props.participant.user.name} has been kicked`
                    );
                    setShowOptions(false)
                    setTimeout(refreshParticipants, 500)
                  }
                );
              }}
            >
              Kick
            </Button>
          </div>
          <article>
            Change role:{" "}
            {props.self?.role === ConversationRoleEnum.OWNER ? (
              props.participant.role === ConversationRoleEnum.USER ? (
                <>
                  <Button
                    danger
                    fullWidth
                    onClick={() => {
                      promoteUser(ConversationRoleEnum.OWNER, true);
                    }}
                  >
                    OWNER
                  </Button>
                  <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                    <Button
                      danger
                      fullWidth
                      onClick={() => {
                        promoteUser(ConversationRoleEnum.ADMIN, true);
                      }}
                    >
                      ADMIN
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    danger
                    fullWidth
                    onClick={() => {
                      promoteUser(ConversationRoleEnum.OWNER, true);
                    }}
                  >
                    OWNER
                  </Button>
                  <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                    <Button
                      danger
                      fullWidth
                      onClick={() => {
                        promoteUser(ConversationRoleEnum.USER, false);
                      }}
                    >
                      USER
                    </Button>
                  </div>
                </>
              )
            ) : (
              <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                <Button
                  danger
                  fullWidth
                  onClick={() => {
                    promoteUser(ConversationRoleEnum.ADMIN, true);
                  }}
                >
                  ADMIN
                </Button>
              </div>
            )}
          </article>
        </article>
        {error.length ? <article>{error}</article> : <></>}
        {success.length ? <article>{success}</article> : <></>}
      </section>
    );
  }
  return (
    <section
      onClick={(e) => {
        setShowOptions(false);
      }}
      style={{
        border: "solid 1px white",
        borderRadius: "20px",
        width: "60%",
        marginLeft: "20%",
        marginBottom: "20px",
        position: "relative",
      }}
    >
      <article
        onClick={() => {
          setShowOptions(false);
        }}
        className={styles.cross}
      >
        <Image src={ToggleCross} alt="toggle bar" width={10} height={10} />
      </article>
      <article>
        {props.participant.user.name}
        <Link
          href={`/profile/${props.participant.user.name}`}
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "10px",
            }}
          >
            <Button primary>Profil</Button>
          </div>
        </Link>
      </article>
      <article>Role : {props.participant.role}</article>
      <article>
        {props.participant.restrictions.length ? (
          props.participant.restrictions.filter(
            (e) => e.status === conversationRestrictionEnum.BAN
          ).length ? (
            "BANNED"
          ) : (
            "MUTED"
          )
        ) : (
          <></>
        )}
      </article>
    </section>
  );
}
