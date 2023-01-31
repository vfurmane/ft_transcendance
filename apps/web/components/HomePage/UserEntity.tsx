import React, { useState } from "react";
import Image from "next/image";
import Connect from "../../public/statusConnect.png";
// import RemoveFriend from "../../public/RemoveFriend.png";
import User from "../../interface/UserInterface";
import styles from "styles/entity.module.scss";
import textStyles from "styles/text.module.scss";
import Link from "next/link";
import Message from "../../public/message.png";
import valide from "../../public/valide.png";
import refuse from "../../public/crossRed.png";

export default function UserEntity(props: {
  user: User;
  key: number;
  index: number;
  option: { del?: boolean; accept?: boolean; ask: boolean };
  small: boolean;
  handleClick: (e: {
    index: number;
    openMenu: boolean;
    setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
  }) => void;
  delFriendClick: (e: { idToDelete: string; index: number }) => void;
}): JSX.Element {
  const [openMenu, setOpenMenu] = useState(false);
  const [accept, setAccept] = useState(props.option?.accept);

  if (typeof props.user === "undefined" || !props.option) return <></>;

  function valideClick(): void {
<<<<<<< HEAD
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/friendships/validate/${props.user.id}`,
      {
        method: "PATCH",
      }
    )
=======
    const data = {
      initiator_id: props.user.id,
      target_id: UserState.id,
    };

    fetch(`/api/friendships/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
>>>>>>> origin
      .then(function (response) {
        response.json().then((res) => {
          if (res === 1) {
            console.log("validation succes");
            setAccept(true);
          }
        });
      })
      .catch(function (error) {
        console.log(
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
            href={{
              pathname: "../profile",
              query: { user: JSON.stringify(props.user) },
            }}
            className={styles.buttonEntity}
          >
            <h3 className={textStyles.laquer}>profil</h3>
          </Link>
          <Link href={""} className={styles.buttonEntity}>
            <Image alt="message" src={Message} width={30} height={30} />
          </Link>
          <Link href={""} className={styles.buttonEntity}>
            <h3 className={textStyles.laquer}>Play</h3>
          </Link>
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
            <Image
              alt="avatar"
              src={`/avatar/avatar-${props.user.avatar_num}.png`}
              width={47}
              height={47}
            />
          </div>
          {props.user.status === "online" ? (
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
            <p className={textStyles.saira}>{props.user.status}</p>
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
                    <div
                      className={styles.valideButton}
                      onClick={(): void => {
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
                  </div>
                )}
              </div>
            ) : (
              <div
                className={styles.supr}
                onClick={(): void => {
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
