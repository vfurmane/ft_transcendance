import React, { useEffect, useState } from "react";
import Image from "next/image";
import Logo from "../public/Logo.png";
import Search from "../public/Search.png";
import ToggleBar from "../public/toggleBar.png";
import ToggleCross from "../public/toggleCross.png";
import Link from "next/link";
import { selectUserState, setUserState } from "../store/UserSlice";
import { useDispatch, useSelector } from "react-redux";
import UserEntity from "./HomePage/UserEntity";
import styles from "styles/topBar.module.scss";
import textStyles from "styles/text.module.scss";
import List from "./HomePage/List";
import { Userfront as User } from "types";
import { initUser } from "../initType/UserInit";
import { clearTokens } from "../helpers/clearTokens";
import { useRouter } from "next/router";

interface propsTopBar {
  openToggle: boolean;
  openProfil: boolean;
  openUserList: boolean;
  clickTopBarToggle: () => void;
  clickTopBarProfil: () => void;
  writeSearchTopBar: (e: boolean) => void;
  handleClickUserMenu(e: {
    index: number;
    openMenu: boolean;
    setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
  }): void;
}

async function logout(): Promise<null> {
  const response = await fetch(`/api/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  }).then(async (response) => {
    if (!response.ok) {
      return response.json().then((error) => {
        throw new Error(error.message || "An unexpected error occured...");
      });
    } else {
      return response.json();
    }
  });
  if (!response) return null;
  return response;
}

function TopBar(props: propsTopBar): JSX.Element {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [userList, setUserList] = useState([<></>]);

  const UserState = useSelector(selectUserState);
  const dispatch = useDispatch();

  function clickToggle(): void {
    props.clickTopBarToggle();
    if (!props.openToggle && props.openProfil) props.clickTopBarProfil();
    if (props.openProfil) props.clickTopBarProfil();
  }

  function clickProfil(): void {
    props.clickTopBarProfil();
  }

  function clickSearchBar(): void {
    if (value.length) props.writeSearchTopBar(true);
    else props.writeSearchTopBar(false);
  }

  function changeValue(val: string): void {
    setValue(val);
    if (!val.length) props.writeSearchTopBar(false);
    else props.writeSearchTopBar(true);
  }

  function logoutHandler(): void {
    logout()
      .then(() => {
        clearTokens();
        dispatch(setUserState(initUser));
        router.push("/login");
      })
      .catch((error) => console.error(error));
  }

  useEffect((): void => {
    if (value.length) {
      fetch(`/api/search?letters=${value}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("access_token"),
        },
      })
        .then(function (response) {
          response.json().then(function (data) {
            const userListTmp: JSX.Element[] = [];
            data.map((e: User, i: number) => {
              const user = e;
              const userEntity = (
                <UserEntity
                  small={true}
                  option={{ del: false, accept: true, ask: false }}
                  user={user}
                  key={i}
                  index={i}
                  handleClick={props.handleClickUserMenu}
                  delFriendClick={(): void => {
                    null;
                  }}
                />
              );
              userListTmp.push(userEntity);
            });
            setUserList([...userListTmp]);
          });
        })
        .catch(function (error) {
          console.log(
            "Il y a eu un problème avec l'opération fetch : " + error.message
          );
        });
    }
  }, [value, props.handleClickUserMenu]);

  return (
    <div className={styles.containerTopBar}>
      <div className="d-none d-md-block">
        <div className={styles.elementTopBar}>
          <Link href={"/home"}>
            <Image alt="logo" src={Logo} width={200} height={30} />
          </Link>
          <Link className={styles.leaderBoardLink} href="/home#leaderBoard">
            Leaderboard
          </Link>
        </div>
      </div>
      <div className="d-none d-md-block ">
        <div className={styles.elementTopBar}>
          <div>
            <Image
              alt="search"
              src={Search}
              width={20}
              height={20}
              className={styles.logoSearchBar}
            />
            <input
              type={"text"}
              placeholder={"Search someone..."}
              className={styles.searchBar}
              value={value}
              onClick={clickSearchBar}
              onChange={(e): void => changeValue(e.target.value)}
            />
          </div>
          <div className="fill small">
            <Image
              alt="avatar"
              src={`/avatar/avatar-${UserState.avatar_num}.png`}
              width={45}
              height={45}
              onClick={clickProfil}
            />
          </div>
        </div>
      </div>
      <div className="d-md-none">
        <div className={styles.elementTopBar}>
          <Link href={"/home"}>
            <Image alt="logo" src={Logo} width={170} height={20} />
          </Link>
        </div>
      </div>
      <div className="d-md-none">
        <div
          className={`${styles.elementTopBar}  ${styles.toggle}`}
          onClick={clickToggle}
        >
          {!props.openToggle ? (
            <Image alt="toggle" src={ToggleBar} width={35} height={35} />
          ) : (
            <Image alt="toggle" src={ToggleCross} width={35} height={35} />
          )}
        </div>
        {props.openToggle ? (
          <div>
            <div
              className={`${styles.elementTopBar} ${styles.toggle} ${styles.menu}`}
            >
              <div>
                <Image
                  alt="search"
                  src={Search}
                  width={15}
                  height={15}
                  className={styles.logoSearchBar}
                />
                <input
                  type={"text"}
                  placeholder={"Search someone..."}
                  className={`${styles.searchBar}  ${styles.toggle}`}
                  value={value}
                  onClick={clickSearchBar}
                  onChange={(e): void => changeValue(e.target.value)}
                />
              </div>
              <div className="fill small">
                <Image
                  alt="avatar"
                  src={`/avatar/avatar-${UserState.avatar_num}.png`}
                  width={42}
                  height={42}
                  onClick={clickProfil}
                />
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
      {props.openProfil ? (
        <div
          className={
            props.openToggle
              ? `${styles.elementTopBar}  ${styles.toggle}  ${styles.avatarMenu}  ${styles.open}`
              : `${styles.elementTopBar}  ${styles.toggle}  ${styles.avatarMenu}`
          }
        >
          <div className={styles.contextMenuContainer}>
            <Link
              href={{
                pathname: "/profile",
                query: { user: JSON.stringify(UserState) },
              }}
              style={{ textDecoration: "none" }}
            >
              <div className={`${styles.contextMenuEntity}  ${styles.bar}`}>
                <h3 className={textStyles.laquer}>profil</h3>
              </div>
            </Link>
            <div className={styles.contextMenuEntity}>
              <h3 className={textStyles.laquer} onClick={logoutHandler}>
                logout
              </h3>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {props.openUserList ? (
        <div
          className={`${styles.searchContainer} ${
            props.openToggle ? styles.toggle : ""
          }`}
        >
          <div className="card small d-none d-md-block">
            <List list={userList} title={""} />
          </div>
          <div className="card xsmall d-block d-md-none">
            <List list={userList} title={""} />
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default TopBar;
