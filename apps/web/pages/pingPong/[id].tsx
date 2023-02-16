import TopBar from "../../components/TopBar";
import textStyles from "styles/text.module.scss";
import React, { useState, useRef, useEffect, useCallback } from "react";
import MiniProfil from "../../components/miniProfil";
import { useRouter } from "next/router";
import Game from "../../helpers/pong";
import { Game as GameEntity, GameEntityFront, Userfront as User } from "types";
import PlayButton from "../../components/HomePage/PlayButton";
import Link from "next/link";
import playButtonStyles from "styles/playButton.module.scss";
import PlayMenu from "../../components/HomePage/PlayMenu";
import Image from "next/image";
import styles from "styles/pingPong.module.scss";
import { useSelector } from "react-redux";
import { selectUserState } from "../../store/UserSlice";
import { useWebsocketContext } from "../../components/Websocket";
import { current } from "@reduxjs/toolkit";

export default function PingPong(): JSX.Element {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const usersRef = useRef<User[]>([]);
  const canvasRef = useRef(null);
  const [intervalState, setIntervalState] = useState<NodeJS.Timer | null>(null);
  const [MiniProfilArray, setMiniProfilArray] = useState<JSX.Element[]>([]);
  const [classement, setClassement] = useState<JSX.Element[]>([]);
  const [openPlayButton, setOpenPlayButton] = useState(false);
  const openPlayMenuRef = useRef(openPlayButton);
  const [openOverlay, setOpenOverlay] = useState(false);
  const [win, setWin] = useState(false);
  const [endGame, setEndGame] = useState(false);
  const [printButton, setPrintButton] = useState(true);
  const [game, setGame] = useState<Game | null>(null);

  /*======for close topBar component when click on screen====*/
  const [openToggle, setOpenToggle] = useState(false);
  const [openProfil, setOpenProfil] = useState(false);
  const [openUserList, setOpenUserList] = useState(false);
  const [indexOfUser, setIndexOfUser] = useState(-1);
  const prevIndexOfUserRef = useRef(-1);
  const prevSetterUsermenuRef =
    useRef<React.Dispatch<React.SetStateAction<boolean>>>();
  /*===========================================================*/

  const UserState = useSelector(selectUserState);
  const websockets = useWebsocketContext();
  websockets.pong?.on('endGame', () => {
      //if (!Game.isSolo)
      setEndGame(true);
  });

  function rotate( user : User[]) {
    let lastIndex = user.length - 1;
    let angle : number = 0;
    switch (user.length)
    {
        case 2 :
        {
            angle = -180;
            break;
        }
        case 3 :
        {
            angle = -120;
            break;
        }
        case 4 :
        {
            angle = -90;
            break;
        }
        case 5 :
        {
            angle = -72;
            break;
        }
        case 6 :
        {
            angle = -60;
            break;
        }
        default :
            break;
    }
    
    const canvas = document.getElementById("canvasElem");
    if (canvas)
      canvas.style.transform = `rotate(${angle * user.findIndex(e => e.id === UserState.id)}deg)`;
        
    while (user.length &&  user[0].id !== UserState.id)
    {
        const last = user[lastIndex];
        user.unshift(last);
        user.pop();
    }
    return user;
  };

  const changeLife = useCallback((index: number, val: number) => {
        if (!users.length) return;
        const rectifiIndex = usersRef.current.findIndex(e => e.id === UserState.id);
        index = index - rectifiIndex >= 0? index - rectifiIndex : users.length - rectifiIndex;
        let tmp = [...MiniProfilArray];
        if (val === 0 )
        {
          console.log('chanhe life index :', index);
            if (intervalState)
                clearInterval(intervalState);
            let tempUsers = [...users];
            let newClassement = [createTrClassement(tempUsers[index], classement), ...classement];
            if (newClassement.length <= usersRef.current.length)
                setClassement(newClassement);
            if (users.length > 2 && tempUsers[index].id === UserState.id)
                setOpenOverlay(true);
            tempUsers.splice(index, 1);
            tmp.splice(index, 1);
            if (tempUsers.length === 1)
            {
                if (tempUsers[0].id === UserState.id)
                    setWin(true);
                if (newClassement.length + 1 <= usersRef.current.length)
                    setClassement([createTrClassement(tempUsers[0], newClassement), ...newClassement]);
                setPrintButton(true);
                return ;
            }
            tmp.forEach((e, i) => <MiniProfil key={index} left={i % 2 == 0 ? true : false} user={{ user: tempUsers[i], index: i }} life={tmp[i]?.props.life} score={tmp[i]?.props.score} game={{ life: Game.live, score: Game.scoreMax, numOfPlayers: tmp.length }} />);
            console.log('i update the game');
            setGame(new Game(tempUsers.length, tempUsers.findIndex(e => e.id === UserState.id), changeLife));
            setUsers(tempUsers);
            setMiniProfilArray(tmp);
        }
        else if (tmp[index]?.props.life !== val)
        {
            tmp[index] = <MiniProfil key={index} left={index % 2 == 0 ? true : false} user={{ user: users[index], index: index }} life={val} score={tmp[index]?.props.score} game={{ life: Game.live, score: Game.scoreMax, numOfPlayers: tmp.length }} />
            if (users.length === 2) {
              console.log('hello');
                index = index ? 0 : 1;
                tmp[index] = <MiniProfil key={index} left={index % 2 == 0 ? true : false} user={{ user: users[index], index: index }} life={tmp[index]?.props.life} score={tmp[index]?.props.score + 1} game={{ life: Game.live, score: Game.scoreMax, numOfPlayers: tmp.length}} />
            }
            setMiniProfilArray(tmp);
        }
    }, [users]);

  
  useEffect(() => {
    if (websockets.pong) {
      websockets.pong.emit(
        "subscribe_game",
        { id: router.query.id },
        (game: GameEntityFront) => {
          setPrintButton(false);
          let tmp = game.opponents.map((opponent) => opponent.user);
          usersRef.current = game.opponents.map((opponent) => opponent.user);
          tmp = rotate(tmp);
          setUsers(tmp);
          setMiniProfilArray(
            tmp.map((e: User, i: number) => (
              <MiniProfil
                key={i}
                left={i % 2 == 0 ? true : false}
                user={{ user: e, index: i }}
                life={Game.live}
                score={0}
                game={{
                  life: Game.live,
                  score: Game.scoreMax,
                  numOfPlayers: tmp.length,
                }}
              />
            ))
          );
        }
      );
    }

    window.addEventListener(
      "keydown",
      function (e) {
        if (
          ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
            e.code
          ) > -1
        ) {
          e.preventDefault();
        }
      },
      false
    );

    return () => {
      if (websockets.pong) {
        websockets.pong.emit("unsubscribe_game");
      }
    };
  }, [websockets.pong, router.query.id]);


  useEffect(() => {
    if (users.length === 0) return;
    console.log('in setGame')
    setGame(
      new Game(
        users.length,
        usersRef.current.findIndex((user) => user.id === UserState.id),
        changeLife
      )
    );
  }, [UserState.id, users, changeLife]);

  useEffect(() => {
    if (canvasRef && users.length > 1) {
      if (websockets.pong?.connected && users.length > 1 && game) {
        game?.setWebsocket(websockets.pong);
        game?.init(canvasRef);
        if (game) setIntervalState(setInterval(handleResize, 17, game));
      }
    }
    return (): void => {
      if (intervalState) clearInterval(intervalState);
    };
  }, [game]);

  /*======for close topBar component when click on screen====*/
  function clickTopBarToggle(): void {
    setOpenToggle(!openToggle);
  }

  function clickTopBarProfil(): void {
    setOpenProfil(!openProfil);
  }

  function writeSearchTopBar(e: boolean): void {
    setOpenUserList(e);
  }

  function handleClickUserMenu(e: {
    index: number;
    openMenu: boolean;
    setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
  }): void {
    e.setOpenMenu(true);
    if (
      prevSetterUsermenuRef.current &&
      prevSetterUsermenuRef.current !== e.setOpenMenu
    )
      prevSetterUsermenuRef.current(false);
    prevSetterUsermenuRef.current = e.setOpenMenu;
    setIndexOfUser(e.index);
    prevIndexOfUserRef.current = e.index;
  }
  /*==========================================================*/

  function close(): void {
    if (openProfil) setOpenProfil(false);
    if (openUserList && indexOfUser === prevIndexOfUserRef.current) {
      setOpenUserList(false);
      if (prevSetterUsermenuRef.current) {
        prevSetterUsermenuRef.current(false);
        setIndexOfUser(-1);
        prevIndexOfUserRef.current = -1;
      }
    }
    if (openPlayButton) setOpenPlayButton(false);

    if (openOverlay && openPlayMenuRef.current === openPlayButton)
      setOpenOverlay(false);
  }

  function handleResize(game: Game) {
    game.updateGame();
  }

  function createTrClassement(user: User, classement: JSX.Element[]) {
    if (!user) return <></>;
    return (
      <tr key={user.id}>
        <td>
          <div style={{ display: "flex" }}>
            <div className="fill small">
              <Image
                alt="avatar"
                src={`/avatar/avatar-${user.avatar_num}.png`}
                width={47}
                height={47}
              />
            </div>
            {user.name}
          </div>
        </td>
        <td>{usersRef.current.length - classement.length}</td>
      </tr>
    );
  }

  function handleClickPlayButton(): void {
    openPlayMenuRef.current = !openPlayButton;
    setOpenPlayButton(!openPlayButton);
  }

  function newPartie() {
    console.log("click");
    setUsers([UserState]);
    setEndGame(false);
    setMiniProfilArray([]);
    setPrintButton(true);
  }

  const buttons = (
    <div className={styles.buttons}>
      <Link href={"/home"} className={styles.link}>
        <PlayButton
          open={false}
          style={{
            text: openPlayButton ? "" : "HOME",
            small: true,
            color: false,
          }}
        />
      </Link>
      {openOverlay ? (
        <div>
          <PlayButton
            open={false}
            style={{
              text: openPlayButton ? "" : "continu to WATCH",
              small: true,
              color: false,
            }}
          />
        </div>
      ) : (
        <></>
      )}
      <Link href={""} className={styles.link}>
        <PlayButton
          handleClick={handleClickPlayButton}
          open={openPlayButton}
          style={{
            text: openPlayButton ? "" : "PLAY AGAIN",
            small: true,
            color: true,
          }}
        />
      </Link>
      {openPlayButton ? (
        <div
          className="col-10 offset-1 offset-xl-0 offset-lg-1 col-lg-3 offset-xl-1 "
          style={{ width: "80%" }}
        >
          <div className={`${playButtonStyles.playMenuContainer} d-block `}>
            <PlayMenu click={() => newPartie()} />
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );

  return (
    <div onClick={() => close()} style={{ width: "100vw", height: "100vh" }}>
      {openOverlay ? (
        <div className="overlay">
          <h1 className={textStyles.saira} style={{ color: "white" }}>
            You LOose !
          </h1>
          {buttons}
        </div>
      ) : (
        <></>
      )}
      <TopBar
        openProfil={openProfil}
        openToggle={openToggle}
        openUserList={openUserList}
        clickTopBarProfil={clickTopBarProfil}
        clickTopBarToggle={clickTopBarToggle}
        writeSearchTopBar={writeSearchTopBar}
        handleClickUserMenu={handleClickUserMenu}
      />
      {!endGame ? (
        <div>
          {MiniProfilArray}

          <div className={`containerScrollHorizon midle`}>
            <span className={`textScroll ${textStyles.pixel}`}>
              - Pong - pOnG - poNg - PONG - pOng&nbsp;
            </span>
            <span className={`textScroll ${textStyles.pixel}`}>
              - Pong - pOnG - poNg - PONG - pOng&nbsp;
            </span>
          </div>
          <div
            style={{
              marginTop:
                users.length > 2
                  ? "25vh"
                  : users.length === 1
                  ? "20vh"
                  : "35vh",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <canvas
              id="canvasElem"
              ref={canvasRef}
              style={{
                marginLeft: users.length > 2 ? "30vw" : "",
                border: "1px solid white",
              }}
            ></canvas>
          </div>
        </div>
      ) : (
        <div className={styles.afterGameContainer}>
          <h1 className={textStyles.saira + " " + styles.title}>
            You {win ? "Win" : "LOose"} !
          </h1>
          <div className={styles.tableContainer}>
            <table>
              <thead>
                <tr>
                  <th>name</th>
                  <th>classement</th>
                </tr>
              </thead>
              <tbody>{classement}</tbody>
            </table>
          </div>
        </div>
      )}
      {printButton ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {buttons}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
