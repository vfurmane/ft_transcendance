import React, { useState } from "react";
import Image from 'next/image';
import Avatar from '../../asset/Avatar.png';
import Connect from '../../asset/statusConnect.png'
import RemoveFriend from '../../asset/RemoveFriend.png';


export default function FriendEntity (props : {name : string, status: string, key: number, index: number, handleClick: (e : {name: string, index: number})=>void}) : JSX.Element {
    return (
        <div className="shadowContainer">
            <div className="cardContainer entity" onClick={()=>props.handleClick({name: props.name, index:props.index})}>
                <div className="avatarText">
                    <Image  alt='avatar' src={Avatar} width={42} height={42} className='avatar' />
                    <Image alt='status' src={Connect} width={20} height={20} className='statusImage'/>
                    <div className="entityText">
                        <h3>{props.name}</h3>
                        <p>{props.status}</p>
                    </div>
                </div>
                <Image  alt='rm friend' src={RemoveFriend} width={20} height={20} className='L' />
            </div>
            <div className="entityShadow d-none d-sm-block"></div>
        </div>
    );
}