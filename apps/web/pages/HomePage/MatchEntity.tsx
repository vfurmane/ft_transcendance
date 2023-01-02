import React from "react";
import Image from 'next/image';
import Avatar from '../../asset/Avatar.png';

export default function MatchEntity(props : {name : string, score: number, key: number}) : JSX.Element {
    return (
        <div className="shadowContainer">
            <div className="cardContainer entity big">
                <div className="cardContainer">
                    <Image  alt='avatar' src={Avatar} width={42} height={42} className='avatar' />
                    <div className="entityText">
                        <h3>{props.name}</h3>
                        <p>{props.score}</p>
                    </div>
                </div>
                <span>VS</span>
                <div className="cardContainer">
                    <div className="entityText">
                        <h3>{props.name}</h3>
                        <p>{props.score}</p>
                    </div>
                    <Image  alt='avatar' src={Avatar} width={42} height={42} className='avatar' />
                </div>
            </div>
            <div className="entityShadow big"></div>
        </div>
    );
}