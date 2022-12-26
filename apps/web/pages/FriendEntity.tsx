import React from "react";
import Image from 'next/image';
import Avatar from '../asset/Avatar.png';
import RemoveFriend from '../asset/RemoveFriend.png';

export default function FriendEntity () : JSX.Element {
    return (
        <div className="cardContainer entity">
            <div className="cardContainer">
                <Image  alt='avatar' src={Avatar} width={50} height={50} className='avatar image' />
                <div className="friendText">
                    <h3>name</h3>
                    <p>status</p>
                </div>
            </div>
            <Image  alt='rm friend' src={RemoveFriend} width={20} height={20} className='image' />
        </div>
    );
}