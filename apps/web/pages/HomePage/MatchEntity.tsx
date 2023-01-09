import React from "react";
import Image, { StaticImageData } from 'next/image';
import Avatar from '../../asset/Avatar.png';

export default function MatchEntity(props : {name : string, score: number, key: number, url1: string | StaticImageData,  url2: string | StaticImageData}) : JSX.Element {
    return (
        <div className="shadowContainer">
            <div className="cardContainer entity big">
                <div className="cardContainer start">
                    <div className='fill small'>
                        <Image  alt='avatar' src={props.url1} width={47} height={47} />
                    </div>
                    <div className="entityText">
                        <h3>{props.name}</h3>
                        <p className="textCenter">{props.score}</p>
                    </div>
                </div>
                <span>VS</span>
                <div className="cardContainer end">
                    <div className="entityText">
                        <h3>{props.name}</h3>
                        <p className="textCenter">{props.score}</p>
                    </div>
                    <div className='fill small'>
                        <Image  alt='avatar' src={props.url2} width={47} height={47} />
                    </div>
                    
                </div>
            </div>
            <div className="entityShadow big d-none d-sm-block"></div>
        </div>
    );
}