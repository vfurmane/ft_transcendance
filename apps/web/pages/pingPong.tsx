import Canvas from "./pong";
import TopBar from "../components/TopBar";
import textStyles from "styles/text.module.scss";
import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { selectUserState } from "../store/UserSlice";
import styles from 'styles/profil.module.scss';
import Image from "next/image";
import MiniProfil from "../components/miniProfil";

export default function PingPong () : JSX.Element {

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

            <MiniProfil left={true}/>
            <MiniProfil left={false}/>

            <div className={`containerScrollHorizon `}>
                <span className={`textScroll ${textStyles.pixel}`}>- Pong - pOnG - poNg - PONG - pOng&nbsp;</span>
                <span className={`textScroll ${textStyles.pixel}`}>- Pong - pOnG - poNg - PONG - pOng&nbsp;</span>
            </div>

            <div  style={{display: 'flex', alignItems: 'center', marginTop: '400px', flexDirection: 'column'}}>
                <Canvas/>
            </div>
       </div>
        
    );
}