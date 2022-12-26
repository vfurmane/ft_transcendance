import React from 'react';
import TopBar from './TopBar';
import  PlayButton  from './PlayButton';
import  List  from './List';
import FriendEntity from './FriendEntity';

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
                        <List title='Friends List' list={<FriendEntity/>} />
                        <List title='featuring' list={<></>} /> 
                    </div>
                    
                </div>
            </div>
        </div>  
    );
}

export default Home;