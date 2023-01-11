import React from "react";
import Image from 'next/image';
import Connect from '../../public/statusConnect.png';
import User from "../../interface/UserInterface";

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
        div1 = <div className="rank" style={style}>{props.rank}</div>;
        div2 = <div className="level">{props.level}</div>;
    } else {
        div2 = <div className="rank" style={style}>{props.rank}</div>;
        div1 = <div className="level">{props.level}</div>;
    }

   return (
        <div className="leaderBoardContainer">
            {div1}
            <div className="shadowContainer">
                <div className="cardContainer entity small" onClick={()=>props.handleClick({user: props.user, index:(props.rank - 1)})}>
                    <div className="cardContainer">
                        <div className="fill small">
                            <Image  alt='avatar' src={`/avatar/avatar-${props.user.avatar_num}.png`} width={47} height={47} />
                        </div>
                        {props.user.status === 'onligne' ? <Image alt='status' src={Connect} width={20} height={20} className='statusImage'/>
                        : <></>}
                        <div className="entityText">
                            <h3>{props.user.name}</h3>
                            <p>{props.user.status}</p>
                        </div>
                    </div>
                </div>
                <div className="entityShadow small"></div>
            </div>
            {div2}
        </div>
        );
 
        
   
    
}