import React, {useState} from 'react';

export default function PlayMenu() : JSX.Element{
    return (
        <div>
            <div className='entityText playMenuEntity bar'>
                <h3>Training</h3>
                <p>Play against a wall to practice aiming the ball.</p>
            </div>
            <div className='entityText playMenuEntity'>
                <h3>Battle royale</h3>
                <p>Play against 100 other players. Be the last one, be the best one!</p>
            </div>
        </div>
    );
}