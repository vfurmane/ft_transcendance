import Link from "next/link";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { Userfront } from "types";
import UserEntity from "./HomePage/UserEntity";
import styles from "styles/entity.module.scss";
import textStyles from "styles/text.module.scss";
import ProfilePicture from "./ProfilePicture";

export interface WatchGameProps {
  gameId: string;
  users: Userfront[];
}

export function WatchGame(props: WatchGameProps): ReactElement {
  const setterInit: React.Dispatch<React.SetStateAction<boolean>> = () => false;
  const prevIndexOfUserRef = useRef(-1);
  const prevSetterUsermenuRef = useRef(setterInit);
  const [indexOfUser, setIndexOfUser] = useState(-1);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [isShown, setIsShown] = useState(false);
  const [userList, setUserList] = useState<JSX.Element[]>([]);

  const handleClickUserMenu = useCallback(
    (e: {
      index: number;
      openMenu: boolean;
      setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
    }): void => {
      setOpenUserMenu(true);
      e.setOpenMenu(true);
      if (
        prevSetterUsermenuRef.current !== setterInit &&
        prevSetterUsermenuRef.current !== e.setOpenMenu
      )
        prevSetterUsermenuRef.current(false);
      prevSetterUsermenuRef.current = e.setOpenMenu;
      setIndexOfUser(e.index);
      prevIndexOfUserRef.current = e.index;
    },
    []
  );

  useEffect(() => {
    if (!props.users.length) return;
    setUserList(props.users.map((user, i) => {
      return (
        <div className={styles.imageText}>
          <div className="fill small">
            <ProfilePicture
              userId={user.id}
              width={47}
              height={47}
              handleClick={undefined}
              fileHash={null}
            />
          </div>
          {isShown?
          <div >
            <h3 className={textStyles.laquer}>{user.name}</h3>
          </div>:
          <div>
          {i === props.users.length - 1?
          <></> :
          <p className={textStyles.laquer}> vs</p>}</div>}
        </div>
      );
    }))

    const scrollContainer = document.getElementById("scroll");

    scrollContainer!.addEventListener("wheel", (evt) => {
        evt.preventDefault();
        scrollContainer!.scrollLeft -= evt.deltaY;
    });
  }, [props.users, isShown])


  return (
    <div>
      {" "}
      <Link href={`/pingPong/${props.gameId}`} style={{textDecoration:'none'}}><div className={styles.shadowContainer}>
        <div
        className={`${styles.entityContainer} ${styles.entity}`} onMouseEnter={() => setIsShown(true)}
        onMouseLeave={() => setIsShown(false)}
        id="scroll">
          <div className={styles.playerList}>
            {userList}
          </div>
        </div>
        <div
        className={`${styles.entityShadow}   d-none d-sm-block`}
        >
        </div>
      </div></Link>
    </div>
  );
}
