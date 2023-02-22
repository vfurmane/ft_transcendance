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
import styles from "styles/pingPong.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { selectUserState } from "../../store/UserSlice";
import { useWebsocketContext } from "../../components/Websocket";
import ProfilePicture from "../../components/ProfilePicture";
import { setUserGameId } from "../../store/UserSlice";
import { relative } from "path";

export default function PingPong(): JSX.Element {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const usersRef = useRef<User[]>([]);
  const canvasRef = useRef(null);
  const intervalRef = useRef<NodeJS.Timer | null>(null);
  const [MiniProfilArray, setMiniProfilArray] = useState<JSX.Element[]>([]);
  const [classement, setClassement] = useState<JSX.Element[]>([]);
  const [openPlayButton, setOpenPlayButton] = useState(false);
  const openPlayMenuRef = useRef(openPlayButton);
  const [openOverlay, setOpenOverlay] = useState(false);
  const [endGame, setEndGame] = useState(false);
  const [printButton, setPrintButton] = useState(true);
  const [game, setGame] = useState<Game | null>(null);
  const [win, setWin] = useState(false);

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
  const usersGameRef = useRef<User[]>([]);
  const UserState = useSelector(selectUserState);
  const websockets = useWebsocketContext();

  /*websockets.pong?.on("endGame", () => {
    setEndGame(true);
    setOpenOverlay(false);
    setPrintButton(true);
    setGame(null);
  });*/

  const dispatch = useDispatch();
  useEffect(() => {
    if (endGame) dispatch(setUserGameId(undefined));

    if (openOverlay) dispatch(setUserGameId(undefined));

    return () => {
      /*const canvas = document.getElementById("canvasElem");
      if (canvas) {
        canvas.style.transformOrigin = `0px 0px`;
      }*/
    };
  }, [dispatch, router.query.id, endGame, openOverlay]);

  function rotateInit(users: User[]) {
    const size =
      users.findIndex((e) => e.id === UserState.id) === -1
        ? users.length
        : users.length + 1;
    //console.log('-----------------in rotateInit');
    const angle = 360 / size;

    let ratio = 1;
    if (users.length > 4) {
      ratio = 0.5;
    }
    const width = Math.round(window.innerWidth * 0.6);
    const height = Math.round(window.innerWidth * 0.6 * (1 / 2));

    const canvas = document.getElementById("canvasElem");
    if (canvas && game) {
      const wallSize = Math.min(Math.round(width), Math.round(height));
      let centerAxeX = 0;
      if (users.length === 2) centerAxeX = wallSize * ratio;
      else if (users.length === 3)
        centerAxeX = (1 / 3) * (Math.sqrt(3) / 2) * (wallSize * ratio);
      else if (users.length === 4) centerAxeX = (wallSize * ratio) / 2;
      else if (users.length > 4)
        centerAxeX = (wallSize * ratio) / (2 * Math.tan(Math.PI / size));

      canvas.style.transformOrigin = `${centerAxeX}px ${wallSize / 2}px`;
      canvas.style.transform = `rotate(${
        angle * users.findIndex((e) => e.id === UserState.id)
      }deg)`;
    }
  }

  function rotate(users: User[]): User[] {
    // i need the real siwe of the wall
    if (!users.find((user) => UserState.id === user.id)) return users;
    const lastIndex = users.length - 1;
    const angle = -360 / users.length;
    let ratio = 1;
    if (users.length === 5 || users.length === 6) {
      ratio = 0.5;
    }
    const width = Math.round(window.innerWidth * 0.6);
    const height = Math.round(window.innerWidth * 0.6 * (1 / 2));

    const canvas = document.getElementById("canvasElem");
    if (canvas) {
      //console.error('-----------------in Rotate');
      const wallSize = Math.min(Math.round(width), Math.round(height));
      let centerAxeX = 0;
      if (users.length === 2) centerAxeX = wallSize * ratio;
      else if (users.length === 3)
        centerAxeX = (1 / 3) * (Math.sqrt(3) / 2) * (wallSize * ratio);
      else if (users.length === 4) centerAxeX = (wallSize * ratio) / 2;
      else if (users.length > 4)
        centerAxeX =
          (wallSize * ratio) / (2 * Math.tan(Math.PI / users.length));

      canvas.style.transformOrigin = `${centerAxeX}px ${wallSize / 2}px`;

      canvas.style.transform = `rotate(${
        angle * users.findIndex((e) => e.id === UserState.id)
      }deg)`;
    }

    while (users.length && users[0].id !== UserState.id) {
      const last = users[lastIndex];
      users.unshift(last);
      users.pop();
    }
    return users;
  }
  function createMiniProfilArray(users: User[]) {
    return users.map((e: User, i: number) => {
      return (
        <MiniProfil
          key={i}
          left={i % 2 == 0 ? true : false}
          user={{ user: e, index: i }}
          life={Game.live}
          score={0}
          game={{
            life: Game.live,
            score: Game.scoreMax,
            numOfPlayers: users.length,
          }}
        />
      );
    });
  }

  function changeScoreOrLife(index: number, life: number, score: number) {
    const user = MiniProfilArray[index].props.user.user;
    return (
      <MiniProfil
        key={index}
        left={index % 2 == 0 ? true : false}
        user={{ user: user, index: index }}
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

  const changeLife = useCallback(
    (index: number, val: number, length: number) => {
      //console.log('----------------in changelife');
      if (
        !usersGame.length ||
        endGame ||
        index >= usersGame.length ||
        length != usersGame.length
      )
        return;
      const indexHurt = usersRotate.findIndex(
        (e) => e.id === usersGame[index].id
      );
      if (MiniProfilArray[indexHurt].props.life === val) return;
      if (val === 0) {
        //console.log('----------------someone died');
        if (usersGame.length > 2 && usersGame[index].id === UserState.id) {
          //console.log('-------------open overlay');
          setOpenOverlay(true);
        }
        let newClassement = [
          createTrClassement(usersGame[index], classement),
          ...classement,
        ];
        const newUsersGame = [...usersGame];
        newUsersGame.splice(index, 1);
        rotateInit(newUsersGame);
        if (newUsersGame.length === 1) {
          //console.log('----------------end game');
          if (newUsersGame[0].id === UserState.id) setWin(true);
          newClassement = [
            createTrClassement(newUsersGame[0], newClassement),
            ...newClassement,
          ];
          //console.log(newClassement);
          setClassement(newClassement);
          setEndGame(true);
          setOpenOverlay(false);
          setPrintButton(true);
          return;
        }
        setClassement(newClassement);
        setUsersGame(newUsersGame);
        let rotateUsers = [...newUsersGame];
        rotateUsers = rotate(rotateUsers);
        setUsersRotate(rotateUsers);
        setMiniProfilArray(createMiniProfilArray(rotateUsers));
        //console.log('----------------end died');
      } else {
        //console.log('----------------someone loose life');
        const newMiniProfilArray = [...MiniProfilArray];
        newMiniProfilArray[indexHurt] = changeScoreOrLife(
          indexHurt,
          val,
          MiniProfilArray[indexHurt].props.score
        );
        if (usersGame.length === 2) {
          //console.log('----------------someone mark point');
          const indexWin = indexHurt !== 0 ? 0 : 1;
          const life = Number(newMiniProfilArray[indexWin].props.life);
          const score =
            Game.live - Number(newMiniProfilArray[indexHurt].props.life);
          newMiniProfilArray[indexWin] = changeScoreOrLife(
            indexWin,
            life,
            score
          );
        }
        //console.log(newMiniProfilArray.map(e => e.props.score));
        setMiniProfilArray(newMiniProfilArray);
      }
    },
    [users, usersGame, usersRotate, MiniProfilArray, classement, endGame, win]
  );

  useEffect(() => {
    if (websockets.pong) {
      websockets.pong.emit(
        "subscribe_game",
        { id: router.query.id },
        (game: GameEntityFront) => {
          if (!game.id) {
            router.replace("/");
            return;
          }
          setPrintButton(false);
          let tmp = game.opponents.map((opponent) => opponent.user);
          usersRef.current = game.opponents.map((opponent) => opponent.user);
          //console.log('----------------in first useEffect');
          setUsersGame(usersRef.current);
          tmp = rotate(tmp);
          setUsers(tmp);
          setUsersRotate(tmp);
          setMiniProfilArray(createMiniProfilArray(tmp));
        }
      );
    }

    function catchKey(e: KeyboardEvent) {
      if (
        ["ArrowUp", "ArrowDown"].indexOf(
          e.code
        ) > -1
      ) {
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", catchKey, false);

    return () => {
      /*if (websockets.pong?.connected) {
        websockets.pong.emit("unsubscribe_game", { id: router.query.id });
      }*/
      window.removeEventListener("keydown", catchKey);
    };
  }, [websockets.pong, router.query.id]);

  useEffect(() => {
    //console.log('----------------in UseEffect');

    if (usersGame.length === 0) return;
    if (game) {
      //console.log("-----------------set Game.changeLife");
      Game.changeLife = changeLife;
    }
    if (usersGame.length !== usersGameRef.current.length && !endGame) {
      //console.log("-----------------setGame");
      if (usersGame.findIndex((user) => user.id === UserState.id) === -1) {
        window.addEventListener(
          "keydown",
          function (e) {
            if (
              [
                "ArrowUp",
                "ArrowDown",
              ].indexOf(e.code) > -1
            ) {
              e.preventDefault();
            }
          },
          false
        );
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
      //console.error('------------------setGame');
      //console.error(usersGame.length);
      const index = usersGame.findIndex((user) => user.id === UserState.id);
      if (index >= 0) dispatch(setUserGameId(router.query.id));
      setGame(new Game(usersGame.length, index, changeLife));
      usersGameRef.current = usersGame;
    }
  }, [users, usersGame, usersRotate, changeLife, dispatch]);

  useEffect(() => {
    if (canvasRef && users.length > 1) {
      if (websockets.pong?.connected && users.length > 1 && game) {
        game?.setWebsocket(websockets.pong);
        game?.init(canvasRef);
        if (game) intervalRef.current = setInterval(handleResize, 4, game);
      }
    }
    return (): void => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        websockets.pong?.emit("unsubscribe_game");
      }
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
              <ProfilePicture
                userId={user.id}
                width={47}
                height={47}
                handleClick={undefined}
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
    setUsers([UserState]);
    setEndGame(false);
    setMiniProfilArray([]);
    setPrintButton(true);
  }

  const buttons = (
    <div className={styles.buttons}>
      <Link href={"/"} className={styles.link}>
        <PlayButton
          open={false}
          style={{
            text: openPlayButton ? "" : "HOME",
            small: true,
            color: false,
          }}
        />
      </Link>

      <PlayButton
        handleClick={handleClickPlayButton}
        open={openPlayButton}
        style={{
          text: openPlayButton ? "" : "PLAY AGAIN",
          small: true,
          color: true,
        }}
      />
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

          <div className={`containerScrollHorizon`}>
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
                usersGame.length > 2
                  ? "25vh"
                  : usersGame.length === 1
                  ? "20vh"
                  : "35vh",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {" "}
            <canvas
              id="canvasElem"
              ref={canvasRef}
              style={{
                marginLeft: usersGame.length > 2 ? "30vw" : "",
                //border: "1px solid white", // NEED TO REMOVE FOR BATTLE ROYAL SINCE NON-RECTANGULAR BOARD DOESNT NOT FIT THE CANVAS
              }}
            ></canvas>
          </div>
        </div>
      ) : (
        <div className={styles.afterGameContainer}>
          <h1 className={textStyles.saira + " " + styles.title}>Game Over</h1>
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
