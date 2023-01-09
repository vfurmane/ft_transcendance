import React, { useState } from "react";
import Image from 'next/image';
import Connect from '../../public/statusConnect.png'
import RemoveFriend from '../../public/RemoveFriend.png';


export default function FriendEntity (props : {name : string, status: string, key: number, url: string, index: number, handleClick: (e : {name: string, index: number})=>void}) : JSX.Element {
    return (
        <div className="shadowContainer">
            <div className="cardContainer entity" onClick={()=>props.handleClick({name: props.name, index:props.index})}>
                <div className="avatarText">
                    <div className="fill small">
                        <Image  alt='avatar' src={props.url} width={47} height={47} />
                    </div>
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