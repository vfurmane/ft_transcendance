import TopBar from "../components/TopBar";
import textStyles from "styles/text.module.scss";
import React, { useState, useRef, useEffect } from "react";
import MiniProfil from "../components/miniProfil";
import { useRouter } from "next/router";
import Game from "./pong";
import { Userfront } from "types";
import { initUser } from "../initType/UserInit";

export default function PingPong () : JSX.Element {
    /*======for close topBar component when click on screen====*/
    const [openToggle, setOpenToggle] = useState(false);
    const [openProfil, setOpenProfil] = useState(false);
    const [openUserList, setOpenUserList] = useState(false);
    const [indexOfUser, setIndexOfUser] = useState(-1);
    const prevIndexOfUserRef = useRef(-1);

    const [user, setUser] = useState(initUser);
    const [users, setUsers] = useState([initUser]);

    useEffect(() => {
        fetch(`/api/user`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
        }
        })
        .then(function (response) {
            return response.json();
        })
        .then((data) => {
            setUser(data);
        })
        .catch(function (error) {
            console.log(`probleme with fetch: ${error.message}`);
        });
    }, []);

    
    const [MiniProfilArray, setMiniProfilArray] = useState([<></>])

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


    function handleResize(game: Game) {
        game.updateGame();
      }


    
    useEffect(() => {
        setUsers([user, user, user]);
        setMiniProfilArray(users.map((e, i) => <MiniProfil left={i % 2 == 0? true : false} user={{user:e, index: i}} life={Game.live} score={0} game={{life: Game.live, score: Game.scoreMax, numOfPlayers: users.length}}/>));
    }, [user]);


    function changeLife(index : number){
        let tmp = [...MiniProfilArray];
        tmp[index] = <MiniProfil left={index % 2 == 0? true : false} user={{user: users[index], index: index}} life={tmp[index]?.props.life - 1} score={tmp[index]?.props.score} game={{life: Game.live, score: Game.scoreMax, numOfPlayers: users.length}}/>
        if (users.length === 2)
        {
            index = index? 0 : 1;
            tmp[index] = <MiniProfil left={index % 2 == 0? true : false} user={{user: users[index], index: index}} life={tmp[index]?.props.life} score={tmp[index]?.props.score + 1} game={{life: Game.live, score: Game.scoreMax, numOfPlayers: users.length}}/>
        }
        setMiniProfilArray(tmp);
    }
      
   
    let router = useRouter();
    const canvasRef = useRef(null);
    if (canvasRef) {
        let game = new Game(Number(router.query.number_player), Number(router.query.position), router, changeLife);
        useEffect(() => {
        game.init(canvasRef);
        setInterval(handleResize, 17, game);
    }, []);
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

            {MiniProfilArray}

            <div className={`containerScrollHorizon `}>
                <span className={`textScroll ${textStyles.pixel}`}>- Pong - pOnG - poNg - PONG - pOng&nbsp;</span>
                <span className={`textScroll ${textStyles.pixel}`}>- Pong - pOnG - poNg - PONG - pOng&nbsp;</span>
            </div>

            <div  style={{display: 'flex', alignItems: 'center', marginTop: '400px', flexDirection: 'column'}}>
                    <canvas ref={canvasRef} style={{marginLeft: users.length > 2? '20%' : ''}} ></canvas>
            </div>
       </div>
        
    );
}