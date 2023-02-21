import React, { useCallback, useEffect, useRef, useState } from "react";
import TopBar from "../components/TopBar";
import PlayButton from "../components/HomePage/PlayButton";
import List from "../components/HomePage/List";
import UserEntity from "../components/HomePage/UserEntity";
import ArrayDoubleColumn from "../components/HomePage/ArrayDoubleColumn";
import PlayMenu from "../components/HomePage/PlayMenu";
import { GameStartPayload, Userfront as User } from "types";
import Link from "next/link";
import ChatBar from "../components/chatBar";
import playButtonStyles from "styles/playButton.module.scss";
import textStyles from "styles/text.module.scss";
import styles from "styles/home.module.scss";
import { useWebsocketContext } from "../components/Websocket";
import { WatchGame } from "../components/WatchGame";

function Home(): JSX.Element {
  const friendListRef = useRef<JSX.Element[]>([]);
  const setterInit: React.Dispatch<React.SetStateAction<boolean>> = () => false;
  const websockets = useWebsocketContext();

  const [openPlayButton, setOpenPlayButton] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [indexOfUser, setIndexOfUser] = useState(-1);
  const [friendList, setFriendList] = useState<JSX.Element[]>([]);
  const [featuringList, setFeaturingList] = useState<JSX.Element[]>([]);

  const prevIndexOfUserRef = useRef(-1);
  const prevSetterUsermenuRef = useRef(setterInit);

  /*======for close topBar component when click on screen====*/
  const [openToggle, setOpenToggle] = useState(false);
  const [openProfil, setOpenProfil] = useState(false);
  const [openUserList, setOpenUserList] = useState(false);

  function clickTopBarToggle(): void {
    setOpenToggle(!openToggle);
  }

  function clickTopBarProfil(): void {
    setOpenProfil(!openProfil);
  }

  function writeSearchTopBar(e: boolean): void {
    setOpenUserList(e);
  }
  /*==========================================================*/

  function handleClickPlayButton(): void {
    setOpenPlayButton(!openPlayButton);
  }

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

  function close(): void {
    if (openPlayButton) setOpenPlayButton(!openPlayButton);
    if (
      (openUserMenu || openUserList) &&
      indexOfUser === prevIndexOfUserRef.current
    ) {
      if (openUserList) setOpenUserList(false);
      else setOpenUserMenu(!openUserMenu);
      prevSetterUsermenuRef.current(false);
      setIndexOfUser(-1);
      prevIndexOfUserRef.current = -1;
    }
    if (openProfil) setOpenProfil(false);
  }

  function delFriendClick(e: { idToDelete: string; index: number }): void {
    fetch(`/api/friendships/${e.idToDelete}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
    }).catch(function (error) {
      console.error(
        "Il y a eu un problème avec l'opération fetch : " + error.message
      );
    });

    friendListRef.current = friendListRef.current.filter(
      (el) => el.props.user.id !== e.idToDelete
    );
    setFriendList([...friendListRef.current]);
  }

  useEffect(() => {
    if (websockets.pong) {
      websockets.pong.on("game_start", (gameStartPayload: GameStartPayload) => {
        const elm = (
          <WatchGame
            gameId={gameStartPayload.id}
            users={gameStartPayload.users}
          />
        );
        setFeaturingList((f) => [elm, ...f]);
      });
      websockets.pong.on("game_end", (gameStartPayload: GameStartPayload) => {
        setFeaturingList((f) =>
          f.filter((game) => game.props.gameId !== gameStartPayload.id)
        );
      });

      websockets.pong.emit("get_featuring", (data: GameStartPayload[]) => {
        setFeaturingList((f) => [
          ...data.map((game) => {
            return <WatchGame gameId={game.id} users={game.users} />;
          }),
          ...f,
        ]);
      });
    }

    return () => {
      if (websockets.pong) {
        websockets.pong.off("game_start");
        websockets.pong.off("game_end");
      }
    };
  }, [websockets.pong]);

  //get the friend list of the user
  useEffect(() => {
    fetch(`/api/friendships`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
    })
      .then(function (response) {
        if (response.ok) {
          return response.json().then(function (json) {
            const friendListTmp: JSX.Element[] = [];
            json.map(
              (
                e: { friend: User; accept: boolean; ask: boolean },
                i: number
              ) => {
                const key = i;
                const user = e.friend;
                const userEntity = (
                  <UserEntity
                    small={false}
                    option={{ del: true, accept: e.accept, ask: e.ask }}
                    user={user}
                    key={key}
                    index={i}
                    handleClick={handleClickUserMenu}
                    delFriendClick={delFriendClick}
                  />
                );
                friendListTmp.push(userEntity);
              }
            );
            setFriendList([...friendListTmp]);
            friendListRef.current = friendListTmp;
          });
        }
      })
      .catch(function (error) {
        console.error(
          "Now that's embarassing... there has been an issue while fetching data : " +
            error.message
        );
      });
  }, [handleClickUserMenu]);

  return (
    <div onClick={(): void => close()} id={"top"}>
      <TopBar
        openProfil={openProfil}
        openToggle={openToggle}
        openUserList={openUserList}
        clickTopBarProfil={clickTopBarProfil}
        clickTopBarToggle={clickTopBarToggle}
        writeSearchTopBar={writeSearchTopBar}
        handleClickUserMenu={handleClickUserMenu}
      />
      <div className={`${styles.illustration} d-none d-lg-block`}></div>
      <div className="container" style={{ overflow: "hidden", height: "100%" }}>
        <div className={`containerScrollVertical`}>
          <span className={`textScroll ${textStyles.pixel}`}>
            -Ft_Transcendence-Ft_Transcendence-Ft_Transcendence&nbsp;
          </span>
          <span className={`textScroll ${textStyles.pixel}`}>
            -Ft_Transcendence-Ft_Transcendence-Ft_Transcendence&nbsp;
          </span>
        </div>
        <div className={`containerScrollVertical inv`}>
          <span className={`textScroll inv ${textStyles.laquer}`}>
            -Ft_Transcendence-Ft_Transcendence-Ft_Transcendence&nbsp;
          </span>
          <span className={`textScroll inv ${textStyles.laquer}`}>
            -Ft_Transcendence-Ft_Transcendence-Ft_Transcendence&nbsp;
          </span>
        </div>
        <div className="row">
          <div
            className={
              openPlayButton ? "col-12 col-lg-3 offset-lg-4" : "col-12"
            }
          >
            <PlayButton
              handleClick={handleClickPlayButton}
              open={openPlayButton}
              style={{ text: "PLAY", small: false, color: true }}
            />
          </div>
          {openPlayButton ? (
            <div className="col-10 offset-1 offset-xl-0 offset-lg-1 col-lg-3 offset-xl-1 ">
              <div
                className={`${playButtonStyles.playMenuContainer} d-block d-lg-none`}
              >
                <PlayMenu />
              </div>
              <div
                className={`d-none d-lg-block ${playButtonStyles.playMenuContainer} ${playButtonStyles.marge_top} `}
              >
                <PlayMenu />
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
        <div className="row">
          <div className="col-10 offset-1 col-lg-4">
            <div className="card">
              <List title="Friends List" list={friendList} />
            </div>
          </div>
          <div className="col-10 offset-1  offset-lg-0 col-lg-6">
            <div className="card">
              <List title="featuring" list={featuringList} />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-8 offset-2">
            <h3 className={`${styles.text} ${textStyles.laquer}`}>
              These guy are the best pong player of the world ... we are so
              proud of them !!
            </h3>
          </div>
        </div>
        <div className="row">
          <div className="col-10 offset-1" id="leaderboard">
            <ArrayDoubleColumn
              title="leaderboard"
              handleClick={handleClickUserMenu}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-4 offset-4">
            <Link href={"#top"} style={{ textDecoration: "none" }}>
              <p
                className={textStyles.saira}
                style={{ textAlign: "center", marginTop: "50px" }}
              >
                Go back to top
              </p>
            </Link>
          </div>
        </div>
      </div>
      <ChatBar />
    </div>
  );
}

export default Home;
