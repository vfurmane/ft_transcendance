import React from 'react';

export default function List(props : {title: string, list : JSX.Element[]}):  JSX.Element {
    return (
        <div className='card'>
            <h2>{props.title}</h2>
            {props.list}
        </div>
    );
}