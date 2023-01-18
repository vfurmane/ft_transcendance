import React from "react";
import Image from 'next/image';
import Connect from '../../public/statusConnect.png';
import User from "../../interface/UserInterface";
import leaderBoardStyles from 'styles/leaderBoard.module.scss';
import textStyle from 'styles/text.module.scss';
import styles from 'styles/entity.module.scss';
import UserEntity from "./UserEntity";

export default function leaderboardEntity(props : {user : User, index: number, key: number, handleClick : (e : {index: number, openMenu: boolean, setOpenMenu : React.Dispatch<React.SetStateAction<boolean>>})=>void }) : JSX.Element {
    
    if (typeof props.user === 'undefined')
        return <div></div>;

    let div1 : JSX.Element;
    let div2 : JSX.Element;

    let color = `rgb(${234 - ((props.user.rank) * 15)}, ${196 - ((props.user.rank - 1) * 5)}, ${53 - ((props.user.rank - 1) * 2)})`;

    let style = {
        backgroundColor: color
    }

    if (props.user.rank && Number(props.user.rank.toString().slice(-1)) <= 5 && Number(props.user.rank.toString().slice(-1)) != 0)
    {
        div1 = <div className={leaderBoardStyles.rank} style={style}>{props.user.rank}</div>;
        div2 = <div className={leaderBoardStyles.level}>{props.user.level}</div>;
    } else {
        div2 = <div className={leaderBoardStyles.rank} style={style}>{props.user.rank}</div>;
        div1 = <div className={leaderBoardStyles.level}>{props.user.level}</div>;
    }

   return (
        <div className={leaderBoardStyles.leaderBoardContainer}>
            {div1}
            <UserEntity key={props.user.rank} small={true} del={false} user={props.user}  index={props.index} handleClick={props.handleClick} delFriendClick={()=>{}}/>
            {div2}
        </div>
        );
 
        
   
    
}