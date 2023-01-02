import React, {useState} from 'react';
import Image from 'next/image';
import Message from '../../asset/message.png';


export default function ArrayDoubleColumn(props : {title: string, list : JSX.Element[], openLeft ?: boolean, openRight?: boolean, name?: string, index?: number}):  JSX.Element {
    const [columnNum, setColumnNum] = useState(1);
    const [pageNum, setPageNum] = useState(1);

    function prevClick(){
        if (columnNum > 1)
        {
            setColumnNum((prev)=>prev - 2);
            setPageNum((prev)=>prev - 1);
        }
            
    }

    function nextClick(){
        if (columnNum < Math.floor(props.list.length / 5))
        {
            setColumnNum((prev)=>prev + 2);
            setPageNum((prev)=>prev + 1);
        }
            
    }


    function getColumn(num: number) : JSX.Element[]{

        if ((props.openLeft || props.openRight) && typeof(props.index) !== 'undefined' && ((Number(props.index.toString().slice(-1)) < 5 && num % 2 > 0) || (Number(props.index.toString().slice(-1)) >= 5 && num % 2 === 0)))
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
                    {getColumn(columnNum)}
                </div>
                <div>
                    {getColumn(columnNum + 1)}
                </div>
            </div>
            <div className='shadowContainer arrayPrevNext'>
                <h3 onClick={()=>prevClick()}>{'<'}</h3>
                <h3>{pageNum }</h3>
                <h3>of</h3>
                <h3>{typeof(props.list) !== 'undefined' ? Math.ceil(props.list.length / 10) : ''}</h3>
                <h3 onClick={()=>nextClick()}>{'>'}</h3>
            </div>
            
        </div>
    );
}