import React from 'react';

export default function ArrayDoubleColumn(props : {title: string, list : JSX.Element[]}):  JSX.Element {
    
    function getColumn(num: number) : JSX.Element[]{
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