import React, {useState} from 'react';
import TopBar from '../TopBar';
import  PlayButton  from './PlayButton';
import  List  from './List';
import FriendEntity from './FriendEntity';
import MatchEntity from './MatchEntity';
import LeaderboardEntity from './LeaderboardEntity';
import ArrayDoubleColumn from './ArrayDoubleColumn';
import PlayMenu from './PlayMenu';


function Home() : JSX.Element {
    let friendList : JSX.Element[] = [];
    let matchList : JSX.Element[] = [];
    let leaderboard : JSX.Element[] = [];

    const [openPlayButton, setOpenPlayButton] = useState(false);
    const [openFriendMenu, setOpenFriendMenu] = useState(false);
    const [openFriendMenuLeaderBrdLeft, setOpenFriendMenuLeaderBrdLeft] = useState(false);
    const [openFriendMenuLeaderBrdRight, setOpenFriendMenuLeaderBrdRight] = useState(false);
    const [nameOfFriend, setNameOfFriend] = useState('');
    const [indexOfFriend, setIndexOfFriend] = useState(0);
    const [clickOnLeaderBoardItem, setClickOnLeaderBoardItem] = useState(false);

    function handleClickPlayButton() : void {
        setOpenPlayButton(!openPlayButton);
    }

    function handleClickFriendMenu( e : {name : string, index: number}) : void {
        setOpenFriendMenu(true);
        setNameOfFriend(e.name);
        setIndexOfFriend(e.index);
    }

    function handleClickFriendMenuLeaderBrd( e : {name : string, index: number}) : void {
        if (Number(e.index.toString().slice(-1)) < 5)
            setOpenFriendMenuLeaderBrdLeft(true);
        if ( Number(e.index.toString().slice(-1)) >= 5)
            setOpenFriendMenuLeaderBrdRight(true);

        setNameOfFriend(e.name);
        setIndexOfFriend(e.index);
        setClickOnLeaderBoardItem(true);
    }

    function close() :void {
        if (openPlayButton)
            setOpenPlayButton(!openPlayButton);
        if (openFriendMenu)
            setOpenFriendMenu(!openFriendMenu);
        if (openFriendMenuLeaderBrdLeft)
            setOpenFriendMenuLeaderBrdLeft(!openFriendMenuLeaderBrdLeft);
        if (openFriendMenuLeaderBrdRight)
            setOpenFriendMenuLeaderBrdRight(!openFriendMenuLeaderBrdRight);
    }

    

    for (let i = 0; i < 22; i++)
    {
        friendList.push(<FriendEntity name={'name' + (i + 1).toString()} status='status' key={i} index={i} handleClick={handleClickFriendMenu} />);
        matchList.push(<MatchEntity name={'name' + (i + 1).toString()} score={5} key={i}/>);
        leaderboard.push(<LeaderboardEntity name={'name' + (i + 1).toString()} level={420} rank={i + 1} status='status' key={i} handleClick={handleClickFriendMenuLeaderBrd}/>)
    }

    return (
        <div onClick={()=>close()} >
            <TopBar/>
            <div className='illustration d-none d-lg-block'></div>
            <div className='container '> 
                    <div className='row'>
                        <div className='col-10 offset-1'>
                            <h3 className='title'>Ft_Transcendence</h3>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-3 offset-3 offset-lg-4 offset-xl-5'>
                            <PlayButton handleClick={handleClickPlayButton} open={openPlayButton}/>
                        </div>
                        {openPlayButton ? 
                        <div className='col-10 offset-1 offset-xl-0 offset-lg-1 col-lg-3 '>
                            <div className='playMenuContainer'>
                                <PlayMenu/>
                            </div> 
                        </div>
                        : <></>}
                    </div>
                    <div className='row'>
                        <div className='col-10 offset-1 col-lg-4'>
                            <List title='Friends List' list={friendList} open={openFriendMenu} name={nameOfFriend} index={indexOfFriend}/>
                        </div>
                        <div className='col-10 offset-1  offset-lg-0 col-lg-6'>
                            <List title='featuring' list={matchList} />
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-8 offset-2'>
                            <h3 className='title small'>These guy are the best pong player of the world ... we are so pround of them !!</h3>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-10 offset-1'>
                            <ArrayDoubleColumn title='leaderboard' list={leaderboard} openLeft={openFriendMenuLeaderBrdLeft} openRight={openFriendMenuLeaderBrdRight} name={nameOfFriend} index={indexOfFriend}/>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-4 offset-4'>
                            <p className='textCenter'>Go back to top</p>
                        </div>
                    </div>
                </div>
            
        </div>  
    );
}

export default Home;