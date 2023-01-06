import React, { useState } from 'react';
import Image from 'next/image';
import Message from '../../asset/message.png';
import Link from 'next/link';

export default function List(props: { title: string, list: JSX.Element[], open?: boolean, name?: string, index?: number }): JSX.Element {

    if (props.open && typeof(props.index) !== 'undefined') {
    props.list[props.index] =   <div className="shadowContainer">
                                    <div className="cardContainer entity">
                                        <button className='buttonFriend'><Link href={{pathname:"../ProfilePage/Profil", query: {name: props.name}} }style={{ textDecoration: 'none' }}><h3>profil</h3></Link></button>
                                        <button className='buttonFriend'><Image alt='message' src={Message} width={30} height={30} /></button>
                                        <button className='buttonFriend yellow'><h3>Play</h3></button>
                                    </div>
                                    <div className="entityShadow d-none d-sm-block"></div>
                                </div>
    }
      return (
            <div className='card'>
                <h2>{props.title}</h2>
                {props.list}
            </div>
        );
}