import React from "react";
import Image from 'next/image';
import Avatar from '../asset/Avatar.png';
import Connect from '../asset/statusConnect.png'

export default function leaderboardEntity(props : {name : string, level: number, rank: number, status : string}) : JSX.Element {
    return (
        <div className="leaderBoardContainer">
            <div>{props.rank}</div>
            <div className="shadowContainer">
                <div className="cardContainer entity">
                    <div className="cardContainer">
                        <Image  alt='avatar' src={Avatar} width={42} height={42} className='avatar L' />
                        <Image alt='status' src={Connect} width={20} height={20} className='statusImage'/>
                        <div className="entityText">
                            <h3>{props.name}</h3>
                            <p>{props.status}</p>
                        </div>
                    </div>
                </div>
                <div className="entityShadow"></div>
                
            </div>
            <div>{props.level}</div>
        </div>
        
    );
}