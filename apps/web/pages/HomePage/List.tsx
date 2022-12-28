import React, {useState} from 'react';
import Image from 'next/image';
import Message from '../../asset/message.png'

export default function List(props : {title: string, list : JSX.Element[], open ?: boolean, name?: string, index?: number}):  JSX.Element {
    
    if (!props.open)
    {
        return (
            <div className='card'>
                <h2>{props.title}</h2>
                {props.list}
            </div>   
        );
    } else {
        return (
            <div className='card friendMenuContainer'>
                {(typeof(props.index) !== 'undefined')? props.list[props.index] : ''}
                <button className='buttonFriend'><h3>profil</h3></button>
                <button className='buttonFriend'><Image alt='message' src={Message} width={42} height={42} /></button>
                <button className='buttonFriend yellow'><h3>Play with {props.name}</h3></button>
            </div> 
        );
    }
}