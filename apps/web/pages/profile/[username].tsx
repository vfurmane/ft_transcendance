import React, { useCallback, useEffect, useRef, useState } from "react";
import TopBar from "../../components/TopBar";
import { useRouter } from "next/router";
import Image from "next/image";
import MatchEntity from "../../components/HomePage/MatchEntity";
import { selectUserState } from "../../store/UserSlice";
import { useDispatch, useSelector } from "react-redux";
import { initUser } from "../../initType/UserInit";
import AchivementEntity from "../../components/ProfilePage/achivementEntity";
import { Achievements, MatchFront } from "types";
import ChangePswrd from "../../components/ProfilePage/ChangePswrd";
import ChangeUsername from "../../components/ProfilePage/ChangeUsername";
import ChatBar from "../../components/chatBar";
import styles from "styles/profil.module.scss";
import textStyles from "styles/text.module.scss";
import ConfigTfa from "../../components/ProfilePage/ConfigTfa";
import ProfilePictureUploader from "../../components/ProfilePictureUploader";
import { useWebsocketContext } from "../../components/Websocket";
import {
  blockUser,
  selectBlockedUsersState,
  unblockUser,
} from "../../store/BlockedUsersSlice";

export default function Profil(): JSX.Element {
  const UserState = useSelector(selectUserState);
  const setterInit: React.Dispatch<React.SetStateAction<boolean>> = () => {
    null;
  };

  const prevAchievementRef = useRef<Achievements | null>(null);
  const router = useRouter();
  const [user, setUser] = useState(initUser);
  const [openAchivementList, setOpenAchivementList] = useState(false);
  const [openAchivement, setOpenAchivement] = useState(false);
  const [achievementsList, setAchievementsList] = useState<JSX.Element[]>([]);
  const [achievementSelect, setAchievementSelect] =
    useState<Achievements | null>(null);
  const [userProfil, setUserProfil] = useState(false);
  const [openConfigProfil, setOpenConfigProfil] = useState(false);
  const [configProfil, setConfigProfil] = useState(<></>);
  const [matchHistory, setMatchHistory] = useState<MatchFront[]>([]);
  const [listOfMatch, setListOfMatch] = useState<JSX.Element[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const dispatch = useDispatch();
  const [avatarHash, setAvatarHash] = useState<string | null>(null);
  const websockets = useWebsocketContext();
  const BlockedUsersState = useSelector(selectBlockedUsersState);

  /*======for close topBar component when click on screen====*/
  const [openToggle, setOpenToggle] = useState(false);
  const [openProfil, setOpenProfil] = useState(false);
  const [openUserList, setOpenUserList] = useState(false);
  const [indexOfUser, setIndexOfUser] = useState(-1);
  const prevIndexOfUserRef = useRef(-1);
  const prevSetterUsermenuRef = useRef(setterInit);

  useEffect(() => {
    if (BlockedUsersState.find((userId) => userId === user.id))
      setIsBlocked(true);
    else setIsBlocked(false);
  }, [BlockedUsersState, user.id]);

  function blockUserOnClick(): void {
    if (websockets.conversations) {
      websockets.conversations.emit(
        "block_user",
        { targetId: user.id },
        ({ targetId }: { targetId: string | null }) => {
          if (targetId) dispatch(blockUser(targetId));
        }
      );
    }
  }

  function unblockUserOnClick(): void {
    if (websockets.conversations) {
      websockets.conversations.emit(
        "unblock_user",
        { targetId: user.id },
        ({ targetId }: { targetId: string | null }) => {
          if (targetId) dispatch(unblockUser(targetId));
        }
      );
    }
  }

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
      prevSetterUsermenuRef.current !== setterInit &&
      prevSetterUsermenuRef.current !== e.setOpenMenu
    )
      prevSetterUsermenuRef.current(false);
    prevSetterUsermenuRef.current = e.setOpenMenu;
    setIndexOfUser(e.index);
    prevIndexOfUserRef.current = e.index;
  }
  /*==========================================================*/

  useEffect((): void => {
    // if (router.query.username !== UserState.name) {
    // if foreign user
    fetch(`/api/user/${router.query.username}`, {
      credentials: "same-origin",
    })
      .then(async (response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.message || "An unexpected error occured...");
          });
        } else {
          return response.json();
        }
      })
      .then((response) => {
        setUser(response);
      })
      .catch(() => {
        router.replace("/");
      });
    setUserProfil(router.query.username === UserState.name);

    if (typeof router.query.username === "string") {
      fetch(`/api/achievements/${router.query.username}`, {
        credentials: "same-origin",
      })
        .then((res) => res.json())
        .then((data) => {
          setAchievementsList(
            data.map((e: Achievements, i: number) => (
              <AchivementEntity
                achievement={{
                  id: e.id,
                  title: e.title,
                  description: e.description,
                  logo: e.logo,
                  created_at: e.created_at,
                  user: e.user,
                }}
                key={i}
                handleClick={achievementClick}
                className={`achievement${i}`}
              />
            ))
          );
        })
        .catch((error) => {
          console.error(`problem with fetch : ${error.message}`);
        });
    }
  }, [router.query, UserState, router, user.id]);

  useEffect(() => {
    if (user) {
      fetch(`/api/match/${user.id}`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
      })
        .then((res) => res.json())
        .then((data) => {
          setMatchHistory(data);
        })
        .catch((error) => {
          console.error(`problem with fetch : ${error.message}`);
        });
    }
  }, [user]);

  useEffect(() => {
    const tmp: JSX.Element[] = [];
    for (let i = 0; i < matchHistory.length; i++) {
      tmp.push(
        <MatchEntity
          match={matchHistory[i]}
          user={user}
          key={matchHistory[i].id}
          avatarHash={avatarHash}
        />
      );
    }
    setListOfMatch([...tmp]);

    const level = document.getElementById("level");
    if (level) {
      level.innerText = "0";
      const incrementLevel = (): void => {
        const c = +level.innerText;
        if (c + 1 <= user.level) {
          level.innerText = `${c + 1}`;
          setTimeout(incrementLevel, 100);
        } else {
          level.innerText = `${user.level}`;
        }
      };
      incrementLevel();
    }
  }, [matchHistory, user]);

  function achivementListClick(): void {
    setOpenAchivementList(true);
  }

  function achievementClick(e: { achievement: Achievements }): void {
    setOpenAchivement(true);
    setAchievementSelect(e.achievement);
    prevAchievementRef.current = e.achievement;
    return;
  }

  /*useEffect(() => {
    if (achievementSelect)
    {
      const index = achievementsList.findIndex(e => e.props.achievement.id === achievementSelect.id);
      if (index === -1) return;
      const className = achievementsList[index].props.className;
      console.log(className);
      const elem = document.getElementsByClassName(className);
      console.log(elem);
      elem[0]?.scrollIntoView(true);
    }
  }, [achievementSelect])*/

  function changeUsername(): void {
    setOpenConfigProfil(true);
    setOpenAchivementList(false);
    setConfigProfil(<ChangeUsername />);
  }

  function changePswrd(): void {
    setOpenConfigProfil(true);
    setOpenAchivementList(false);
    setConfigProfil(<ChangePswrd />);
  }

  function configTfa(): void {
    setOpenConfigProfil(true);
    setOpenAchivementList(false);
    setConfigProfil(<ConfigTfa />);
  }

  function close(): void {
    if (openAchivementList && prevAchievementRef.current === achievementSelect)
      setOpenAchivementList(false);
    if (openAchivement && prevAchievementRef.current === achievementSelect) {
      setOpenAchivement(false);
      prevAchievementRef.current = null;
      setAchievementSelect(null);
    }
    if (openProfil) setOpenProfil(false);
    if (openUserList && indexOfUser === prevIndexOfUserRef.current) {
      setOpenUserList(false);
      prevSetterUsermenuRef.current(false);
      setIndexOfUser(-1);
      prevIndexOfUserRef.current = -1;
    }
    return;
  }

  function addFriend(): void {
    fetch(`/api/friendships/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
    }).catch(function (error) {
      console.error(
        "Il y a eu un problème avec l'opération fetch : " + error.message
      );
    });
  }

  return (
    <div onClick={close} style={{ width: "100vw", height: "100vh" }}>
      <TopBar
        openProfil={openProfil}
        openToggle={openToggle}
        openUserList={openUserList}
        clickTopBarProfil={clickTopBarProfil}
        clickTopBarToggle={clickTopBarToggle}
        writeSearchTopBar={writeSearchTopBar}
        handleClickUserMenu={handleClickUserMenu}
        avatarHash={avatarHash}
      />
      <div className="container" style={{ marginTop: "150px" }}>
        <div className="row">
          <div
            className={`col-10 offset-1 offset-md-0 offset-lg-1 col-md-2 ${styles.flexCenterColumn}`}
          >
            <div className="fill">
              <ProfilePictureUploader
                userId={user.id}
                width={200}
                height={200}
                setFileHash={setAvatarHash}
                fileHash={avatarHash}
              />
            </div>
            <div className={styles.rank + " " + textStyles.saira}>
              {user.rank}
            </div>
          </div>
          <div
            className={`col-10 offset-1  col-md-6 offset-lg-0  ${styles.profilMenuContainer}`}
          >
            <div>
              <div className={styles.flex_between}>
                <h2
                  className={textStyles.pixel}
                  style={{
                    color: "white",
                    fontSize: "40px",
                    marginBottom: "10px",
                  }}
                >
                  {user.name}
                </h2>
                <p
                  style={{
                    color: "white",
                    marginBottom: "10px",
                    fontSize: "20px",
                  }}
                  className={textStyles.saira + styles.flex_between}
                >
                  level :{" "}
                  <span
                    id="level"
                    className={textStyles.saira}
                    style={{ fontSize: "40px", color: "white" }}
                  ></span>
                </p>
              </div>
              <div className={styles.buttonAndBarContainer}>
                <div style={{ width: "80%" }}>
                  <div className={styles.flex_between}>
                    <p className={textStyles.saira} style={{ color: "white" }}>
                      {user.victory} victory
                    </p>
                    <p className={textStyles.saira} style={{ color: "white" }}>
                      {user.defeat} defeat
                    </p>
                  </div>
                  <div className={`${styles.flex_between} ${styles.statBar}`}>
                    <div
                      style={{
                        height: "30px",
                        backgroundColor: "#03cea4",
                        width: `${Math.floor(
                          (user.victory / (user.defeat + user.victory)) * 100
                        )}%`,
                      }}
                    ></div>
                    <div
                      style={{
                        height: "30px",
                        backgroundColor: "#e22d44",
                        width: `${Math.floor(
                          (user.defeat / (user.defeat + user.victory)) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div style={{ display: "flex" }}>
                  <Image
                    alt="achivement"
                    src={`/achivement.png`}
                    width={32}
                    height={32}
                    onClick={achivementListClick}
                  />
                  <h3
                    className={textStyles.laquer}
                    style={{ marginLeft: "10px" }}
                  >
                    {achievementsList.length}
                  </h3>
                </div>
              </div>
              {userProfil ? (
                <div className={styles.buttonProfilContainer}>
                  <button
                    className={styles.buttonProfil}
                    onClick={changeUsername}
                  >
                    <h3
                      className={textStyles.laquer}
                      style={{ fontSize: "18px" }}
                    >
                      Change username
                    </h3>
                  </button>
                  <button className={styles.buttonProfil} onClick={changePswrd}>
                    <h3
                      className={textStyles.laquer}
                      style={{ fontSize: "18px" }}
                    >
                      Change password
                    </h3>
                  </button>
                  <button className={styles.buttonProfil} onClick={configTfa}>
                    <h3
                      className={textStyles.laquer}
                      style={{ fontSize: "18px" }}
                    >
                      Configure TFA
                    </h3>
                  </button>
                </div>
              ) : (
                <div className={styles.buttonProfilContainer}>
                  <button
                    className={styles.buttonProfil}
                    style={{ width: "100px", height: "40px" }}
                    onClick={addFriend}
                  >
                    <Image
                      alt="addFriend"
                      src={`/addFriend.png`}
                      width={20}
                      height={20}
                    />
                  </button>
                  <button
                    className={styles.buttonProfil}
                    style={{ width: "100px" }}
                  >
                    <Image
                      alt="message"
                      src={`/message.png`}
                      width={20}
                      height={20}
                    />
                  </button>
                  <button
                    className={styles.buttonProfil}
                    style={{ width: "100px" }}
                    onClick={(): void => {
                      websockets.pong?.emit(
                        "invite",
                        {
                          id: user.id,
                        },
                        () => {
                          router.push("/invite");
                        }
                      );
                    }}
                  >
                    <h3
                      className={textStyles.laquer}
                      style={{ fontSize: "18px" }}
                    >
                      Play
                    </h3>
                  </button>
                  <button
                    className={styles.buttonProfil}
                    style={{ backgroundColor: "#e22d44", width: "100px" }}
                    onClick={isBlocked ? unblockUserOnClick : blockUserOnClick}
                  >
                    <h3
                      className={textStyles.laquer}
                      style={{ fontSize: "18px" }}
                    >
                      {isBlocked ? "unBlock" : "Block"}
                    </h3>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-10 offset-1 col-lg-8">
            {!openAchivementList && !openConfigProfil ? (
              <div className="card" style={{ background: "rgba(0, 0, 0, 0)" }}>
                <h2 className={textStyles.pixel}>Match history</h2>
                <div className="cardList">{listOfMatch}</div>
              </div>
            ) : (
              <div>
                {openAchivementList ? (
                  <div style={{ display: "flex" }}>
                    <div
                      className="card"
                      style={{ background: "rgba(0,0,0,0)" }}
                    >
                      <h2
                        className={textStyles.pixel}
                        style={{ marginBottom: "20px" }}
                      >
                        Achivements
                      </h2>
                      <div className="cardList">{achievementsList}</div>
                    </div>
                    {openAchivement ? (
                      <div
                        className="card"
                        style={{ background: "rgba(0,0,0,0)" }}
                      >
                        <div className="cardList">
                          <p
                            className={textStyles.saira}
                            style={{ marginTop: "120px" }}
                          >
                            {achievementSelect?.description}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                ) : (
                  <div>
                    <p
                      className={textStyles.saira}
                      style={{ color: "white", width: "auto" }}
                    >
                      <Image
                        alt="cross"
                        src={"/toggleCross.png"}
                        width={20}
                        height={20}
                        onClick={(): void => setOpenConfigProfil(false)}
                      />{" "}
                      close
                    </p>
                    {configProfil}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <ChatBar />
    </div>
  );
}
