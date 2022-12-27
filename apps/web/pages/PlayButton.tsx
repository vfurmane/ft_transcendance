import React from 'react';

export default function PlayButton() : JSX.Element {

    return (
        <div className='shadowContainer MB'>
            <button className='playButton' type='button'>PLAY</button>
            <button className='playButtonShadow' type='button'/>
        </div>
        
    );
}