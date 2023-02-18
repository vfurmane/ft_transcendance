import TopBar from "../../components/TopBar";
import textStyles from "styles/text.module.scss";
import React, { useState, useRef, useEffect, useCallback } from "react";
import MiniProfil from "../../components/miniProfil";
import { useRouter } from "next/router";
import Game from "../../helpers/pong";
import { GameEntityFront, Userfront as User } from "types";
import PlayButton from "../../components/HomePage/PlayButton";
import Link from "next/link";
import playButtonStyles from "styles/playButton.module.scss";
import PlayMenu from "../../components/HomePage/PlayMenu";
import Image from "next/image";
import styles from "styles/pingPong.module.scss";
import { useSelector } from "react-redux";
import { selectUserState } from "../../store/UserSlice";
import { useWebsocketContext } from "../../components/Websocket";

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

  const [usersGame, setUsersGame] = useState<User[]>([]);
  const [usersRotate, setUsersRotate] = useState<User[]>([]);
  const usersStart = useRef<User[]>([]);
  const usersRotateRef = useRef<User[]>([]);
  const classementRef = useRef<JSX.Element[]>([]);
  const miniProfilArrayRef = useRef<JSX.Element[]>([]);

  const UserState = useSelector(selectUserState);
  const websockets = useWebsocketContext();
  websockets.pong?.on("endGame", () => {
    setEndGame(true);
    setGame(null);
    setPrintButton(true);
  });
  

  useEffect(() => {
    if (websockets.pong) {
      websockets.pong.emit(
        "subscribe_game",
        { id: router.query.id },
        (game: GameEntityFront) => {
          setPrintButton(false);
          //let tmp = game.opponents.map((opponent) => opponent.user);
          usersStart.current = game.opponents.map((opponent) => opponent.user);
          setUsersGame(() => usersStart.current);
          /*tmp = rotate(tmp);
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
          );*/
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


  function rotateInit(users : User[])
  {
    let angle = 360 / users.length;

    const canvas = document.getElementById("canvasElem");
    if (canvas)
      canvas.style.transform = `rotate(${
        angle * users.findIndex((e) => e.id === UserState.id)
    }deg)`;
  }

  function rotate(users: User[]): User[] {
    const lastIndex = users.length - 1;
    let angle = -360 / users.length;

    const canvas = document.getElementById("canvasElem");
    if (canvas)
      canvas.style.transform = `rotate(${
        angle * users.findIndex((e) => e.id === UserState.id)
      }deg)`;

    while (users.length && users[0].id !== UserState.id) {
      const last = users[lastIndex];
      users.unshift(last);
      users.pop();
    }
    return users;
  }

  function changeScoreOrLife(index : number, life : number, score : number){
    return (
      <MiniProfil
        key={index}
        left={index % 2 == 0 ? true : false}
        user={{ user: users[index], index: index }}
        life={life}
        score={score}
        game={{
          life: Game.live,
          score: Game.scoreMax,
          numOfPlayers: usersGame.length,
        }}
      />
    );
  }

  function  changeLife (index: number, val: number) {
    if (!usersGame.length || !usersRotateRef.current.length) return;
    if (val)
    {
      const indexHit = usersRotateRef.current.findIndex(e => e.id === usersGame[index].id);
      const newMiniProfilArray = [...miniProfilArrayRef.current];
      if (newMiniProfilArray[indexHit].props.life === val) return;
      newMiniProfilArray[indexHit] = changeScoreOrLife(indexHit, val, miniProfilArrayRef.current[indexHit].props.score);
      if (usersGame.length === 2)
      {
        const indexWin = indexHit? 0 : 1;
        const life = Number(miniProfilArrayRef.current[indexWin].props.life);
        const score = Number(miniProfilArrayRef.current[indexWin].props.score) + 1;
        newMiniProfilArray[indexWin] = changeScoreOrLife(indexWin, life, score);
      }
      setMiniProfilArray(() => [...newMiniProfilArray]);
      miniProfilArrayRef.current = newMiniProfilArray;
    }
    else
    {
      rotateInit(usersGame);
      if (usersGame.length > 2 &&  usersGame[index].id === UserState.id)
        setOpenOverlay(true);
      let newClassement = [createTrClassement(usersGame[index], classementRef.current), ...classementRef.current];
      const newUsersGame = [...usersGame];
      newUsersGame.splice(index, 1);
      if (newUsersGame.length === 1)
      {
        newClassement = [createTrClassement(newUsersGame[0], newClassement), ...newClassement];
        setClassement(() => newClassement);
        classementRef.current = newClassement;
        return ;
      }
      setClassement(() => newClassement);
      classementRef.current = newClassement;
      setUsersGame(() => newUsersGame);
    }
  }

 


  useEffect(() => {
    if (usersGame.length < 2) return;
    const rotateUsers = rotate([...usersGame]);
    setUsersRotate(() => [...rotateUsers]);
    usersRotateRef.current = rotateUsers;
    const newMiniProfilArray = rotateUsers.map((e, i) => {
      const life = MiniProfilArray.length === 0? Game.live : MiniProfilArray[i].props.life;
      const score = MiniProfilArray.length === 0? 0: MiniProfilArray[i].props.score;
      return (<MiniProfil
        key={i}
        left={i % 2 == 0 ? true : false}
        user={{ user: e, index: i }}
        life={life}
        score={score}
        game={{
          life: Game.live,
          score: Game.scoreMax,
          numOfPlayers: usersGame.length,
        }}
      />);
    })
    setMiniProfilArray(() => newMiniProfilArray);
    miniProfilArrayRef.current = newMiniProfilArray;

    setGame(
      new Game(
        usersGame.length,
        usersGame.findIndex((user) => user.id === UserState.id),
        changeLife
      )
    );

  }, [usersGame]);

  useEffect(() => {
    if (canvasRef && usersGame.length > 1) {
      if (websockets.pong?.connected && usersGame.length > 1 && game) {
        game?.setWebsocket(websockets.pong);
        game?.init(canvasRef);
        if (game) setIntervalState(setInterval(handleResize, 17, game));
      }
    }
    return (): void => {
      if (intervalState) clearInterval(intervalState);
    };
  }, [game]);


  /*const changeLife = useCallback(
    (index: number, val: number) => {
      if (!users.length) return;
      const rectifiIndex = usersRef.current.findIndex(
        (e) => e.id === UserState.id
      );
      index =
        index - rectifiIndex >= 0
          ? index - rectifiIndex
          : users.length - rectifiIndex;
      const tmp = [...MiniProfilArray];
      if (val === 0) {
        const tempUsers = rotateInit([...users]);
        const newClassement = [
          createTrClassement(tempUsers[index], classement),
          ...classement,
        ];
        if (newClassement.length <= usersRef.current.length)
          setClassement(newClassement);
        if (users.length > 2 && tempUsers[index].id === UserState.id)
          setOpenOverlay(true);
        tempUsers.splice(index, 1);
        tmp.splice(index, 1);
        if (tempUsers.length === 0) {
          return;
        }
        if (tempUsers.length === 1) {
          if (tempUsers[0].id === UserState.id) setWin(true);
          if (newClassement.length + 1 <= usersRef.current.length)
            setClassement([
              createTrClassement(tempUsers[0], newClassement),
              ...newClassement,
            ]);
          setPrintButton(true);
          return;
        }
        tmp.forEach((e, i) => (
          <MiniProfil
            key={index}
            left={i % 2 == 0 ? true : false}
            user={{ user: tempUsers[i], index: i }}
            life={tmp[i]?.props.life}
            score={tmp[i]?.props.score}
            game={{
              life: Game.live,
              score: Game.scoreMax,
              numOfPlayers: tmp.length,
            }}
          />
        ));
        console.log("i update the game");
        setGame(
          new Game(
            tempUsers.length,
            tempUsers.findIndex((e) => e.id === UserState.id),
            changeLife
          )
        );
        
        const rotUser = rotateInit([...users]).splice(index, 1);
        setUsers(rotate(rotUser));
        setMiniProfilArray(tmp);
      } else if (tmp[index]?.props.life !== val) {
        tmp[index] = (
          <MiniProfil
            key={index}
            left={index % 2 == 0 ? true : false}
            user={{ user: users[index], index: index }}
            life={val}
            score={tmp[index]?.props.score}
            game={{
              life: Game.live,
              score: Game.scoreMax,
              numOfPlayers: tmp.length,
            }}
          />
        );
        if (users.length === 2) {
          index = index ? 0 : 1;
          tmp[index] = (
            <MiniProfil
              key={index}
              left={index % 2 == 0 ? true : false}
              user={{ user: users[index], index: index }}
              life={tmp[index]?.props.life}
              score={tmp[index]?.props.score + 1}
              game={{
                life: Game.live,
                score: Game.scoreMax,
                numOfPlayers: tmp.length,
              }}
            />
          );
        }
        setMiniProfilArray(tmp);
      }
    },
    [users, classement]
  );*/

 

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

  function handleResize(game: Game): void {
    game.updateGame();
    return;
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
        <td>{usersStart.current.length - classement.length}</td>
      </tr>
    );
  }

  function handleClickPlayButton(): void {
    openPlayMenuRef.current = !openPlayButton;
    setOpenPlayButton(!openPlayButton);
  }

  function newPartie() {
    setUsersGame([]);
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
              //  border: "1px solid white", // NEED TO REMOVE FOR BATTLE ROYAL SINCE NON-RECTANGULAR BOARD DOESNT NOT FIT THE CANVAS
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
