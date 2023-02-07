import TopBar from "../components/TopBar";
import textStyles from "styles/text.module.scss";
import React, { useState, useRef, useEffect } from "react";
import MiniProfil from "../components/miniProfil";
import { useRouter } from "next/router";
import Game from "../helpers/pong";
import { User, Userfront } from "types";
import { initUser } from "../initType/UserInit";
import { Loading } from "../components/Loading";

export default function PingPong(): JSX.Element {
    let router = useRouter();
    const [user, setUser] = useState(initUser);
    const [users, setUsers] = useState([initUser]);
    const usersRef = useRef(users);
    const canvasRef = useRef(null);
    const [intervalState, setIntervalState] = useState<NodeJS.Timer | null>(null);
    const [MiniProfilArray, setMiniProfilArray] = useState([<></>]);
    const [winner, setWinner] = useState(initUser);
    const [classement, setClassement] = useState<JSX.Element[]>([]);


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


    function handleResize(game: Game) {
        game.updateGame();
    }

    useEffect(() => {
        const tmp = [user, user];
        usersRef.current = tmp;
        setUsers(tmp);
        setMiniProfilArray(tmp.map((e, i) => <MiniProfil key={i} left={i % 2 == 0 ? true : false} user={{ user: e, index: i }} life={Game.live} score={0} game={{ life: Game.live, score: Game.scoreMax, numOfPlayers: tmp.length }} />));
    }, [user]);


    function changeLife(index: number) {
        let tmp = [...MiniProfilArray];
        if (tmp[index]?.props.life - 1 === 0)
        {
            if (intervalState)
                clearInterval(intervalState);
            let temp = [...users];
            let newClassement = [
                <tr>
                    <td>{temp[index].name}</td>
                    <td>{usersRef.current.length - classement.length}</td>
                </tr>, ...classement];
            setClassement(newClassement);
            temp.splice(index, 1);
            tmp.splice(index, 1);
            if (temp.length === 1)
            {
                setWinner(temp[0]);
                setClassement([
                    <tr>
                        <td>{temp[0].name}</td>
                        <td>{usersRef.current.length - newClassement.length}</td>
                    </tr>, ...newClassement]);
                temp = [initUser];
                if (intervalState)
                    clearInterval(intervalState);
            }
            const tmpp : JSX.Element[] = [];
            for (let i = 0; i < tmp.length; i++)
                tmpp.push(<MiniProfil key={i} left={i % 2 == 0 ? true : false} user={{ user: temp[i], index: i }} life={tmp[i]?.props.life} score={tmp[i]?.props.score} game={{ life: Game.live, score: Game.scoreMax, numOfPlayers: tmp.length }} />);
            tmp = tmpp;
            game = new Game(Number(temp.length), Number(router.query.position), router, changeLife);
            setUsers(temp);
        }
        else
        {
            tmp[index] = <MiniProfil key={index} left={index % 2 == 0 ? true : false} user={{ user: users[index], index: index }} life={tmp[index]?.props.life - 1} score={tmp[index]?.props.score} game={{ life: Game.live, score: Game.scoreMax, numOfPlayers: tmp.length }} />
            if (users.length === 2) {
                index = index ? 0 : 1;
                tmp[index] = <MiniProfil key={index} left={index % 2 == 0 ? true : false} user={{ user: users[index], index: index }} life={tmp[index]?.props.life} score={tmp[index]?.props.score + 1} game={{ life: Game.live, score: Game.scoreMax, numOfPlayers: tmp.length}} />
            }
        }
        setMiniProfilArray(tmp);
    }

    let game = new Game(Number(/*router.query.number_player*/users.length), Number(router.query.position), router, changeLife);
    useEffect(() => {
        if (canvasRef && users[0] !== initUser) {
            game.init(canvasRef);
            setIntervalState(setInterval(handleResize, 17, game));
        }
        return (() : void => {
            if (intervalState)
                clearInterval(intervalState);
        })
    }, [users]);



    return (
        <div onClick={() => close()} style={{ width: "100vw", height: "100vh" }}>
            <TopBar
                openProfil={openProfil}
                openToggle={openToggle}
                openUserList={openUserList}
                clickTopBarProfil={clickTopBarProfil}
                clickTopBarToggle={clickTopBarToggle}
                writeSearchTopBar={writeSearchTopBar}
                handleClickUserMenu={handleClickUserMenu}
            />
            {users[0] !== initUser?
            <div>
                {MiniProfilArray}

                <div className={`containerScrollHorizon midle`}>
                    <span className={`textScroll ${textStyles.pixel}`}>- Pong - pOnG - poNg - PONG - pOng&nbsp;</span>
                    <span className={`textScroll ${textStyles.pixel}`}>- Pong - pOnG - poNg - PONG - pOng&nbsp;</span>
                </div>
                <div style={{ marginTop: users.length > 2? '25vh' : '35vh', display:'flex', justifyContent:'center'}}>
                    <canvas ref={canvasRef} style={{ marginLeft: users.length > 2 ? '30vw' : '', border: 'solid 0px white'}}></canvas>
                </div>
            </div> :
            <div style={{display: 'flex', justifyContent: 'center', flexDirection:'column'}}>
                <table style={{color:'white', width:'60%'}}>
                    <tr>
                        <td>name</td>
                        <td>classement</td>
                    </tr>
                    {classement}
                </table>
            </div>}
        </div>

    );
}