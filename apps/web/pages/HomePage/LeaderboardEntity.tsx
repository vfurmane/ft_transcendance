import React from "react";
import Image from 'next/image';
import Avatar from '../../asset/Avatar.png';
import Connect from '../../asset/statusConnect.png'

export default function leaderboardEntity(props : {name : string, level: number, rank: number, status : string, key: number, handleClick : (e :{name: string, index: number})=>void }) : JSX.Element {
    
    let div1 : JSX.Element;
    let div2 : JSX.Element;

    if (props.rank && Number(props.rank.toString().slice(-1)) <= 5 && Number(props.rank.toString().slice(-1)) != 0)
    {
        div1 = <div className="rank">{props.rank}</div>;
        div2 = <div className="level">{props.level}</div>;
    } else {
        div2 = <div className="rank">{props.rank}</div>;
        div1 = <div className="level">{props.level}</div>;
    }

    return (
        <div className="leaderBoardContainer">
            {div1}
            <div className="shadowContainer">
                <div className="cardContainer entity small" onClick={()=>props.handleClick({name: props.name, index:(props.rank - 1)})}>
                    <div className="cardContainer">
                        <Image  alt='avatar' src={Avatar} width={42} height={42} className='avatar L' />
                        <Image alt='status' src={Connect} width={20} height={20} className='statusImage'/>
                        <div className="entityText">
                            <h3>{props.name}</h3>
                            <p>{props.status}</p>
                        </div>
                    </div>
                </div>
                <div className="entityShadow small"></div>
            </div>
            {div2}
        </div>
        
    );
    
}