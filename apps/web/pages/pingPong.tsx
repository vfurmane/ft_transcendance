import Canvas from "./pong";
import TopBar from "../components/TopBar";
import textStyles from "styles/text.module.scss";
import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { selectUserState } from "../store/UserSlice";
import styles from 'styles/profil.module.scss';
import Image from "next/image";

export default function PingPong () : JSX.Element {

    const user = useSelector(selectUserState);
    console.log(user);

    /*======for close topBar component when click on screen====*/
    const [openToggle, setOpenToggle] = useState(false);
    const [openProfil, setOpenProfil] = useState(false);
    const [openUserList, setOpenUserList] = useState(false);
    const [indexOfUser, setIndexOfUser] = useState(-1);
    const prevIndexOfUserRef = useRef(-1);

    const setterInit: React.Dispatch<React.SetStateAction<boolean>> = () => {
        console.error("setterInit");
    };
    const prevSetterUsermenuRef = useRef(setterInit);

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

    function close(): void {
        if (openProfil) setOpenProfil(false);
        if (openUserList && indexOfUser === prevIndexOfUserRef.current) {
          setOpenUserList(false);
          prevSetterUsermenuRef.current(false);
          setIndexOfUser(-1);
          prevIndexOfUserRef.current = -1;
        }
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
            />

            <div style={{position: 'absolute', top: "20%", left: '20%', border: 'solid 1px white', width: '30%'}}>
                <div style={{display: 'flex'}}>
                    <div className="fill small">
                        <Image
                            alt="avatar"
                            src={`/avatar/avatar-${user.avatar_num}.png`}
                            width={42}
                            height={42}
                        />
                    </div>
                    
                    <h2
                    className={textStyles.pixel}
                    style={{
                        color: "white",
                        fontSize: "30px",
                        marginRight: "20px",
                        marginTop: "5px"
                    }}
                    >
                    {user.name}
                    </h2>

                    <p
                    style={{
                        color: "white",
                        fontSize: "20px",
                    }}
                    className={textStyles.saira}
                    >
                    level :{user.level}
                    <span
                        id="level"
                        className={textStyles.saira}
                        style={{ fontSize: "30px", color: "white"}}
                    ></span>
                    </p>
                    
                    
                </div>
                <div>
                    <div style={{ width: "100%" }}>
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
                </div>
            </div>


            <div  style={{display: 'flex', alignItems: 'center', marginTop: '100px', flexDirection: 'column'}}>
                <h1 className={textStyles.laquer} style={{color: 'white', fontSize: '100px', marginBottom: '150px'}}>Pong</h1>
                <Canvas/>
            </div>
       </div>
        
    );
}