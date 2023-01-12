import React from "react";
import Image from 'next/image';
import Connect from '../../public/statusConnect.png';
import User from "../../interface/UserInterface";
import leaderBoardStyles from 'styles/leaderBoard.module.scss';
import textStyle from 'styles/text.module.scss';
import styles from 'styles/entity.module.scss';
import FriendEntity from "./FriendEntity";

export default function leaderboardEntity(props : {user : User, level: number, rank: number, key: number, handleClick : (e :{user: User, index: number})=>void }) : JSX.Element {
    
    if (typeof props.user === 'undefined')
        return <div></div>;

    let div1 : JSX.Element;
    let div2 : JSX.Element;

    let color = `rgb(${234 - ((props.rank) * 15)}, ${196 - ((props.rank - 1) * 5)}, ${53 - ((props.rank - 1) * 2)})`;

    let style = {
        backgroundColor: color
    }

    if (props.rank && Number(props.rank.toString().slice(-1)) <= 5 && Number(props.rank.toString().slice(-1)) != 0)
    {
        div1 = <div className={leaderBoardStyles.rank} style={style}>{props.rank}</div>;
        div2 = <div className={leaderBoardStyles.level}>{props.level}</div>;
    } else {
        div2 = <div className={leaderBoardStyles.rank} style={style}>{props.rank}</div>;
        div1 = <div className={leaderBoardStyles.level}>{props.level}</div>;
    }

   return (
        <div className={leaderBoardStyles.leaderBoardContainer}>
            {div1}
            <FriendEntity key={props.rank} small={true} del={false} user={props.user}  index={props.rank - 1} handleClick={props.handleClick}/>
            {div2}
        </div>
        );
 
        
   
    
}