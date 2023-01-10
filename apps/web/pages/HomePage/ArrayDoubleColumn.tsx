import React, {useState} from 'react';
import Image from 'next/image';
import Message from '../../public/message.png';
import Link from 'next/link';
import User from '../../interface/UserInterface';

export default function ArrayDoubleColumn(props : {title: string, list : JSX.Element[], open ?: boolean, user?: User, index?: number}):  JSX.Element {
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

        if (props.open &&  typeof(props.index) !== 'undefined')
        {
            props.list[props.index] = 
                <div className="leaderBoardContainer">
                    <div className="shadowContainer">
                        <div className="cardContainer entity">
                            <button className='buttonFriend'> <Link href={{pathname:"../ProfilePage/Profil", query: {user: JSON.stringify(props.user)}} }style={{ textDecoration: 'none' }}><h3>profil</h3></Link></button>
                            <button className='buttonFriend'><Image alt='message' src={Message} width={30} height={30} /></button>
                            <button className='buttonFriend yellow'><h3>Play</h3></button>
                        </div>
                        <div className="entityShadow d-none d-sm-block"></div>
                    </div>
                </div>
            
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
            <div className='shadowContainer'>
                <h3 className='L' onClick={()=>prevClick()}>{'<'}</h3>
                <h3 className='L'>{pageNum }</h3>
                <h3 className='L'>of</h3>
                <h3 className='L'>{typeof(props.list) !== 'undefined' ? Math.ceil(props.list.length / 10) : ''}</h3>
                <h3 onClick={()=>nextClick()}>{'>'}</h3>
            </div>
            
        </div>
    );
}