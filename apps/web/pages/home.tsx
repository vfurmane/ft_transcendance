import React from 'react';
import TopBar from './TopBar';
import { PlayButton } from './PlayButton';
import { FriendList } from './FriendList';

function Home() : JSX.Element {
    return (
        <div >
            <TopBar/>
            <div className='illustration'>
                <div className='titleAndButton'>
                    <h1 className='title'>
                        Ft_Transcendence
                    </h1>
                    <PlayButton/>
                    <div className='cardContainer'>
                        <FriendList/>
                        <FriendList/> 
                    </div>
                    
                </div>
            </div>
        </div>  
    );
}

export default Home;