import React, {useState} from 'react';
import TopBar from '../TopBar';
import  PlayButton  from './PlayButton';
import  List  from './List';
import FriendEntity from './FriendEntity';
import MatchEntity from './MatchEntity';
import LeaderboardEntity from './LeaderboardEntity';
import ArrayDoubleColumn from './ArrayDoubleColumn';


function Home() : JSX.Element {
    let friendList : JSX.Element[] = [];
    let matchList : JSX.Element[] = [];
    let leaderboard : JSX.Element[] = [];

    const [openPlayButton, setOpenPlayButton] = useState(false);
    const [openFriendMenu, setOpenFriendMenu] = useState(false);
    const [openFriendMenuLeaderBrd, setOpenFriendMenuLeaderBrd] = useState(false);
    const [nameOfFriend, setNameOfFriend] = useState('');
    const [indexOfFriend, setIndexOfFriend] = useState(0);

    function handleClickPlayButton() : void {
        setOpenPlayButton(!openPlayButton);
    }

    function handleClickFriendMenu( e : {name : string, index: number}) : void {
        setOpenFriendMenu(!openFriendMenu);
        setNameOfFriend(e.name);
        setIndexOfFriend(e.index);
    }

    function handleClickFriendMenuLeaderBrd( e : {name : string, index: number}) : void {
        setOpenFriendMenuLeaderBrd(!openFriendMenuLeaderBrd);
        setNameOfFriend(e.name);
        setIndexOfFriend(e.index);
    }

    function close() :void {
        if (openPlayButton)
            setOpenPlayButton(!openPlayButton);
        if (openFriendMenu)
            setOpenFriendMenu(!openFriendMenu);
        if (openFriendMenuLeaderBrd)
            setOpenFriendMenuLeaderBrd(!openFriendMenuLeaderBrd);
    }

    for (let i = 0; i < 22; i++)
    {
        friendList.push(<FriendEntity name={'name' + (i + 1).toString()} status='status' key={i} index={i} handleClick={handleClickFriendMenu} />);
        matchList.push(<MatchEntity name={'name' + (i + 1).toString()} score={5} key={i}/>);
        leaderboard.push(<LeaderboardEntity name={'name' + (i + 1).toString()} level={420} rank={i + 1} status='status' key={i} handleClick={handleClickFriendMenuLeaderBrd}/>)
    }

    return (
        <div onClick={()=>close()}>
            <TopBar/>
            <div className='illustration'>
                <div className='titleAndButton'>
                    <h1 className='title'>
                        Ft_Transcendence
                    </h1>
                    <PlayButton handleClick={handleClickPlayButton} open={openPlayButton}/>
                    <div className='cardContainer'>
                        <List title='Friends List' list={friendList} open={openFriendMenu} name={nameOfFriend} index={indexOfFriend}/>
                        <List title='featuring' list={matchList} />
                    </div>
                    <h3  className='title small'>These guy are the best pong player of the world ... we are so pround of them !!</h3>
                    <div className='cardContainer'>
                        <ArrayDoubleColumn title='leaderboard' list={leaderboard} open={openFriendMenuLeaderBrd} name={nameOfFriend} index={indexOfFriend}/>
                    </div>
                    <p>Go back to top</p>
                </div>
            </div>
        </div>  
    );
}

export default Home;