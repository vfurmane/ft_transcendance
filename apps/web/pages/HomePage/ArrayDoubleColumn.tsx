import React from 'react';
import Image from 'next/image';
import Message from '../../asset/message.png';

export default function ArrayDoubleColumn(props : {title: string, list : JSX.Element[], open ?: boolean, name?: string, index?: number}):  JSX.Element {
    
    function getColumn(num: number) : JSX.Element[]{

        if (props.open && typeof(props.index) !== 'undefined' && ((Number(props.index.toString().slice(-1)) < 5 && num === 1) || (Number(props.index.toString().slice(-1)) >= 5 && num === 2)))
        {
            return (
                [<div className='friendMenuContainer'>
                    {(typeof(props.index) !== 'undefined')? props.list[props.index] : ''}
                    <button className='buttonFriend'><h3>profil</h3></button>
                    <button className='buttonFriend'><Image alt='message' src={Message} width={42} height={42} /></button>
                    <button className='buttonFriend yellow'><h3>Play with {props.name}</h3></button>
                </div>]
            );
        }

        let column : JSX.Element[] = [];
        if (num > 0 && props.list)
        {
            for (let i = 0; i < 5; i++)
                column.push(props.list[i + (5 * (num - 1))]);
        }
        return column;
    }
    
    return (
        <div className='card leaderBoard'>
            <h2>{props.title}</h2>
            <div className='leaderBoardDoubleColumn'>
                <div>
                    {getColumn(1)}
                </div>
                <div>
                    {getColumn(2)}
                </div>
            </div>
            <h3>{'<   1 of 31   >'}</h3>
        </div>
    );
}