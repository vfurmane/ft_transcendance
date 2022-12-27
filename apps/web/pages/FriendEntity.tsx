import React from "react";
import Image from 'next/image';
import Avatar from '../asset/Avatar.png';
import Connect from '../asset/statusConnect.png'
import RemoveFriend from '../asset/RemoveFriend.png';

export default function FriendEntity () : JSX.Element {
    return (
        <div className="shadowContainer">
             <div className="cardContainer entity">
                <div className="cardContainer">
                    <Image  alt='avatar' src={Avatar} width={42} height={42} className='avatar image' />
                    <Image alt='status' src={Connect} width={20} height={20} className='statusImage'/>
                    <div className="friendText">
                        <h3>name</h3>
                        <p>status</p>
                    </div>
                </div>
                <Image  alt='rm friend' src={RemoveFriend} width={20} height={20} className='image' />
            </div>
            <div className="entityShadow"></div>
        </div>
    );
}