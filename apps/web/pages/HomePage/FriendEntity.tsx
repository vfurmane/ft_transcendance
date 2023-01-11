import React, { useState } from "react";
import Image from 'next/image';
import Connect from '../../public/statusConnect.png'
import RemoveFriend from '../../public/RemoveFriend.png';
import User from "../../interface/UserInterface";


export default function FriendEntity (props : {user : User, key: number, index: number, del: boolean, handleClick: (e : {user: User, index: number})=>void}) : JSX.Element {
    if (typeof props.user === 'undefined')
        return <></>;
    return (
        <div className="shadowContainer">
            <div className="cardContainer entity" onClick={()=>props.handleClick({user: props.user, index:props.index})}>
                <div className="avatarText">
                    <div className="fill small">
                        <Image  alt='avatar' src={`/avatar/avatar-${props.user.avatar_num}.png`} width={47} height={47} />
                    </div>
                    {props.user.status === 'onligne' ? <Image alt='status' src={Connect} width={20} height={20} className='statusImage'/>
                    : <div></div>}
                    <div className="entityText">
                        <h3>{props.user.name}</h3>
                        <p>{props.user.status}</p>
                    </div>
                </div>
                {props.del?
                    <Image  alt='rm friend' src={RemoveFriend} width={20} height={20} className='L' />
                :<></>}
            </div>
            <div className="entityShadow d-none d-sm-block"></div>
        </div>
    );
}