import React from "react";
import Image from 'next/image';
import Avatar from '../asset/Avatar.png';
import Connect from '../asset/statusConnect.png'
import RemoveFriend from '../asset/RemoveFriend.png';

export default function FriendEntity (props : {name : string, status: string}) : JSX.Element {
    return (
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
                <Image  alt='rm friend' src={RemoveFriend} width={20} height={20} className='L' />
            </div>
            <div className="cardContainer entity entityShadow">
            </div>
           
        </div>
    );
}