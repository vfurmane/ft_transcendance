import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image from "next/image";
import Connect from "../../public/statusConnect.png";
import { Userfront as User, UserStatusUpdatePayload } from "types";
import styles from "styles/entity.module.scss";
import textStyles from "styles/text.module.scss";
import Link from "next/link";
import Message from "../../public/message.png";
import valide from "../../public/valide.png";
import refuse from "../../public/crossRed.png";
import { useWebsocketContext } from "../Websocket";
import { useDispatch, useSelector } from "react-redux";
import { selectUserState } from "../../store/UserSlice";
import { useRouter } from "next/router";
import ProfilePicture from "../ProfilePicture";
import { setInvitedUser } from "../../store/InvitationSlice";

export default function UserEntity(props: {
  user: User;
  index: number;
  option: { del?: boolean; accept?: boolean; ask: boolean };
  small: boolean;
  handleClick: (e: {
    index: number;
    openMenu: boolean;
    setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
  }) => void;
  delFriendClick?: (e: { idToDelete: string; index: number }) => void;
  avatarHash?: string | null;
}): JSX.Element {
  const [status, setStatus] = useState(props.user.status);
  const [openMenu, setOpenMenu] = useState(false);
  const [accept, setAccept] = useState(props.option?.accept);
  const UserState = useSelector(selectUserState);
  const router = useRouter();
  const dispatch = useDispatch();
  const websockets = useWebsocketContext();

  useEffect(() => {
    const onUserStatusUpdate = (
      userId: string,
      setStatus: Dispatch<SetStateAction<string>>
    ) => {
      return (data: UserStatusUpdatePayload): void => {
        if (data.userId === userId) {
          setStatus(data.type);
        }
      };
    };

    if (props.user.id === UserState.id) {
      setStatus("online");
    } else if (websockets.general?.connected) {
      websockets.general.on(
        "user_status_update",
        onUserStatusUpdate(props.user.id, setStatus)
      );
      websockets.general.emit(
        "subscribe_user",
        { userId: props.user.id },
        onUserStatusUpdate(props.user.id, setStatus)
      );
    }

    return () => {
      if (websockets.general?.connected && props.user.id !== UserState.id) {
        websockets.general.emit("unsubscribe_user", { userId: props.user.id });
        websockets.general.off("user_status_update");
      }
    };
  }, [websockets.general, props.user.id, UserState]);

  if (typeof props.user === "undefined" || !props.option) return <></>;

  function valideClick(): void {
    fetch(`/api/friendships/validate/${props.user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("access_token"),
      },
    })
      .then(function (response) {
        response.json().then((res) => {
          console.log(res);
          if (res) {
            console.log("validation succes");
            setAccept(true);
          }
        });
      })
      .catch(function (error) {
        console.error(
          "Il y a eu un problème avec l'opération fetch : " + error.message
        );
      });
  }

  if (openMenu) {
    return (
      <div className={styles.shadowContainer}>
        <div
          className={`${styles.entityContainer} ${styles.entity} ${
            props.small ? styles.small : ""
          }`}
        >
          <Link
            href={`/profile/${props.user.name}`}
            className={styles.buttonEntity}
          >
            <h3 className={textStyles.laquer}>profil</h3>
          </Link>
          <Link href={""} className={styles.buttonEntity}>
            <Image alt="message" src={Message} width={30} height={30} />
          </Link>
          {UserState.id !== props.user.id ? (
            <Link
              href={""}
              className={styles.buttonEntity}
              onClick={(): void => {
                websockets.pong?.emit(
                  "invite",
                  {
                    id: props.user.id,
                  },
                  () => {
                    dispatch(setInvitedUser(props.user));
                    router.push("/invite");
                  }
                );
              }}
            >
              <h3 className={textStyles.laquer}>Play</h3>
            </Link>
          ) : null}
        </div>
        <div
          className={`${styles.entityShadow} ${
            props.small ? styles.small : ""
          } d-none d-sm-block`}
        ></div>
      </div>
    );
  }

  return (
    <div className={styles.shadowContainer}>
      <div
        className={`${styles.entityContainer} ${styles.entity}  ${
          props.small ? styles.small : ""
        }`}
      >
        <div
          className={styles.imageText}
          onClick={(): void =>
            props.handleClick({
              index: props.index,
              openMenu: openMenu,
              setOpenMenu: setOpenMenu,
            })
          }
        >
          <div className="fill small">
            <ProfilePicture
              userId={props.user.id}
              width={47}
              height={47}
              handleClick={undefined}
              fileHash={props.avatarHash}
            />
          </div>
          {status === "online" ? (
            <Image
              alt="status"
              src={Connect}
              width={20}
              height={20}
              className="statusImage"
            />
          ) : (
            <div></div>
          )}
          <div className={styles.entityText}>
            <h3 className={textStyles.laquer}>{props.user.name}</h3>
            <p className={textStyles.saira}>{status}</p>
          </div>
        </div>
        {props.option.del ? (
          <div>
            {!accept ? (
              <div>
                {props.option.ask ? (
                  <p className={textStyles.saira}>on hold...</p>
                ) : (
                  <div className={styles.entityContainer}>
                    <div className={styles.valideButton} onClick={valideClick}>
                      <Image
                        alt="valide"
                        src={valide}
                        width={20}
                        height={20}
                        style={{ position: "relative", zIndex: "-1" }}
                      />
                    </div>
                    {props.delFriendClick ? (
                      <div
                        className={styles.valideButton}
                        onClick={(): void => {
                          if (props.delFriendClick)
                            props.delFriendClick({
                              idToDelete: props.user.id,
                              index: props.index,
                            });
                        }}
                      >
                        <Image
                          alt="valide"
                          src={refuse}
                          width={20}
                          height={20}
                          style={{ position: "relative", zIndex: "-1" }}
                        />
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ) : (
              <div
                className={styles.supr}
                onClick={(): void => {
                  if (props.delFriendClick)
                    props.delFriendClick({
                      idToDelete: props.user.id,
                      index: props.index,
                    });
                }}
              ></div>
            )}
          </div>
        ) : (
          <></>
        )}
      </div>
      <div
        className={`${styles.entityShadow}  ${
          props.small ? styles.small : ""
        } d-none d-sm-block`}
      ></div>
    </div>
  );
}
