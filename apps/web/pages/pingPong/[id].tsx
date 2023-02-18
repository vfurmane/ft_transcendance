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
import { useSelector } from "react-redux";
import { selectUserState } from "../../store/UserSlice";
import { useWebsocketContext } from "../../components/Websocket";
import ProfilePicture from "../../components/ProfilePicture";

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

  websockets.pong?.on("endGame", () => {
    setEndGame(true);
    setPrintButton(true);
    setGame(null);
  });

  function rotateInit(users: User[])  {
    if (!users.find((user) => UserState.id === user.id)) return;
    const angle = 360 / users.length;

    const canvas = document.getElementById("canvasElem");
    if (canvas)
      canvas.style.transform = `rotate(${
        angle * users.findIndex((e) => e.id === UserState.id)
      }deg)`;
  }

  function rotate(users: User[]): User[] {
    if (!users.find((user) => UserState.id === user.id)) return users;
    const lastIndex = users.length - 1;
    const angle = -360 / users.length;

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
  function createMiniProfilArray(users : User[]){
    return (users.map((e: User, i: number) => {
      const life = MiniProfilArray.length? MiniProfilArray.find(el => el.props.user.id === e.id)?.props.life : Game.live;
      const score =  MiniProfilArray.length? MiniProfilArray.find(el => el.props.user.id === e.id)?.props.score : 0;
      return (<MiniProfil
        key={i}
        left={i % 2 == 0 ? true : false}
        user={{ user: e, index: i }}
        life={life}
        score={score}
        game={{
          life: Game.live,
          score: Game.scoreMax,
          numOfPlayers: users.length,
        }}
      />);
      }));
  }

  function changeScoreOrLife(index : number, life : number, score : number){
    return (
      <MiniProfil
        key={index}
        left={index % 2 == 0 ? true : false}
        user={{ user: usersGame[index], index: index }}
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
    (index: number, val: number) => {
      console.log('----------------in changelife');
      console.log(users);
      console.log(usersGame);
      console.log(usersRotate);
      console.log(MiniProfilArray.map(e => e.props.life));
      
      if (!users.length || endGame) return;
      const indexHurt = usersRotate.findIndex(e => e.id === usersGame[index].id);
      if (MiniProfilArray[indexHurt].props.life === val) return;
      if (val === 0)
      {
        console.log('----------------someone died');
        rotateInit(usersGame);
        if (usersGame.length > 2 && usersGame[index].id === UserState.id)
          setOpenOverlay(true);
        let newClassement = [createTrClassement(usersGame[index], classement), ...classement];
        const newUsersGame = [...usersGame];
        newUsersGame.splice(index, 1);
        console.log(newClassement);
        if (newUsersGame.length === 1)
        {
          console.log('----------------end game');
          if (newUsersGame[0].id === UserState.id)
            setWin(true);
          newClassement = [createTrClassement(newUsersGame[0], newClassement), ...newClassement];
          console.log(newClassement);
          setClassement(newClassement);
          setEndGame(true);
          setPrintButton(true);
          return;
        }
        setClassement(newClassement);
        setUsers(newUsersGame);
        let rotateUsers = [...newUsersGame];
        rotateUsers = rotate(rotateUsers);
        setUsersRotate(rotateUsers);
        setMiniProfilArray(createMiniProfilArray(rotateUsers));
        console.log('----------------someone died');
        console.log(newUsersGame);
        console.log(rotateUsers);
        console.log(createMiniProfilArray(rotateUsers));
      } else  {
        console.log('----------------someone loose life');
        let newMiniProfilArray = [...MiniProfilArray];
        newMiniProfilArray[indexHurt] = changeScoreOrLife(indexHurt, val, MiniProfilArray[indexHurt].props.score);
        console.log(val);
        console.log(newMiniProfilArray.map(e => e.props.life));
        if (usersGame.length === 2)
        {
          console.log('----------------someone mark point');
          const indexWin = indexHurt !== 0? 0 : 1;
          const life = Number(newMiniProfilArray[indexWin].props.life);
          const score = Number(newMiniProfilArray[indexWin].props.score) + 1;
          newMiniProfilArray[indexWin] = changeScoreOrLife(indexWin, life, score);
        }
        console.log(newMiniProfilArray.map(e => e.props.score));
        setMiniProfilArray(newMiniProfilArray);
        /*let tmp = [...MiniProfilArray];
      if (val === 0) {
        
        console.log("change life index :", index);
        if (intervalState) clearInterval(intervalState);
        const tempUsers = [...users];
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
        setUsers(tempUsers);
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
        setMiniProfilArray(tmp);*/
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
          setPrintButton(false);
          let tmp = game.opponents.map((opponent) => opponent.user);
          usersRef.current = game.opponents.map((opponent) => opponent.user);;
          console.log('----------------in first useEffect');
         
          setUsersGame(usersRef.current);
          console.log(usersRef.current);
          tmp = rotate(tmp);
          setUsers(tmp);
          setUsersRotate(tmp);
          console.log(tmp);
          setMiniProfilArray(createMiniProfilArray(tmp));
          console.log(tmp.map((e: User, i: number) => (
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
          )));
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
    console.log('----------------in UseEffect');
    console.log(users);
    console.log(usersGame);
    console.log(usersRotate);
    console.log(MiniProfilArray.map(e => e.props.life));
    if (usersGame.length === 0) return;
    if(game)
    {
      console.log("-----------------set Game.changeLife");
      Game.changeLife = changeLife;
    }
    if (usersGame.length !== usersGameRef.current.length)
    {
      console.log("-----------------setGame");
      setGame(
        new Game(
          usersGame.length,
          usersGame.findIndex((user) => user.id === UserState.id),
          changeLife
        )
      );
      usersGameRef.current = usersGame;
    }
  }, [users, usersGame, usersRotate, changeLife]);

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
            {" "}
            let index = 0;
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
          <h1 className={textStyles.saira + " " + styles.title}>Game Over <br></br> You {win? 'win' : 'loose'} this game !</h1>
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
