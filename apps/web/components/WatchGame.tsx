import Link from "next/link";
import { ReactElement, useCallback, useRef, useState } from "react";
import { Userfront  } from "types";
import UserEntity from "./HomePage/UserEntity";

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

  if (props.users.length != 2) return <></>;

  return (
    <div>
      {" "}
      <UserEntity
        small={false}
        option={{ del: false, accept: true, ask: false }}
        user={props.users[0]}
        index={0}
        handleClick={handleClickUserMenu}
      />
      <p>VS</p>
      <UserEntity
        small={false}
        option={{ del: false, accept: true, ask: false }}
        user={props.users[1]}
        index={1}
        handleClick={handleClickUserMenu}
      />
      <p>
        <Link href={`/pingPong/${props.gameId}`}>Watch</Link>
      </p>
    </div>
  );
}
