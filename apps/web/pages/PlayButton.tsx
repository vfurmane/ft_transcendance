import React from 'react';

export default function PlayButton() : JSX.Element {

    return (
        <div className='playButtonContainer'>
            <button className='playButton' type='button'>PLAY</button>
            <button className='playButtonShadow' type='button'/>
        </div>
        
    );
}