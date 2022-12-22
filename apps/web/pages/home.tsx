import React from 'react';
import TopBar from './TopBar';

function Home() : JSX.Element {
    return (
        <div>
             <TopBar/>
            <div style={{textAlign: 'center'}} >
                <h1 style={{color:'white', width:'450px'}}>Ft_Transcendence is a great web site to play the mythic pong game with your friends !</h1>
            </div>
        </div>  
    );
}

export default Home;