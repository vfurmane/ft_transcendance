import React, {useState} from 'react';

export default function PlayButton(props : {handleClick: ()=>void, open: boolean}) : JSX.Element {   
    return (
        <div className='PlayButtonContainer' >
            <button className='playButton' type='button' onClick={()=>props.handleClick()}>PLAY</button>
            <button className='playButtonShadow' type='button'/>
        </div>
    );
}