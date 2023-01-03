import React, {useState} from 'react';
import PlayMenu from './PlayMenu'

export default function PlayButton(props : {handleClick: ()=>void, open: boolean}) : JSX.Element {   
    return (
        <div className='margePlayButton' >
            <button className='playButton' type='button' onClick={()=>props.handleClick()}>PLAY</button>
            <button className='playButtonShadow' type='button'/>
        </div>
    );
}