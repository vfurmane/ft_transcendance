import React from 'react';
import TopBar from './TopBar';
import  PlayButton  from './PlayButton';
import  List  from './List';
import FriendEntity from './FriendEntity';
import MatchEntity from './MatchEntity';
import LeaderboardEntity from './LeaderboardEntity';

function Home() : JSX.Element {
    let friendList : JSX.Element[] = [];
    let matchList : JSX.Element[] = [];
    let leaderboard : JSX.Element[] = [];

    for (let i = 0; i < 10; i++)
    {
        friendList.push(<FriendEntity name='name' status='status' />);
        matchList.push(<MatchEntity name='name' score={5} />);
        leaderboard.push(<LeaderboardEntity name='name' level={420} rank={0} status='status' />)
    }

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
                        <List title='Friends List' list={friendList} />
                        <List title='featuring' list={matchList} />
                    </div>
                    <h3  className='title small'>These guy are the best pong player of the world ... we are so pround of them !!</h3>
                    <div className='cardContainer'>
                        <List title='leaderboard' list={leaderboard} />
                    </div>
                </div>
            </div>
        </div>  
    );
}

export default Home;