import React, {useEffect, useRef, useState} from 'react';
import TopBar from '../TopBar';
import PlayButton  from './PlayButton';
import List  from './List';
import FriendEntity from './FriendEntity';
import MatchEntity from './MatchEntity';
import LeaderboardEntity from './LeaderboardEntity';
import ArrayDoubleColumn from './ArrayDoubleColumn';
import PlayMenu from './PlayMenu';
import { setUserState } from "../../store/UserSlice";
import { useDispatch } from "react-redux";



function Home() : JSX.Element {
    let friendList : JSX.Element[] = [];
    let matchList : JSX.Element[] = [];
    let leaderboard : JSX.Element[] = [];
    const [openPlayButton, setOpenPlayButton] = useState(false);
    const [openFriendMenu, setOpenFriendMenu] = useState(false);
    const [openFriendMenuLeaderBrd, setOpenFriendMenuLeaderBrd] = useState(false);
    const [nameOfFriend, setNameOfFriend] = useState('');
    const [indexOfFriend, setIndexOfFriend] = useState(0);

    const prevIndexOfFriendRef = useRef(0);
    const prevIndexOfFriendMenuLeaderBordRef = useRef(0);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setUserState(
            {
                id: 'store is working',
                name: 'max',
                avatar_num: 1,
                status: 'branchWithStore'
            }))
    },[])

    function handleClickPlayButton() : void {
        setOpenPlayButton(!openPlayButton);
    }

    function handleClickFriendMenu( e : {name : string, index: number}) : void {
        setOpenFriendMenu(true);
        setNameOfFriend(e.name);
        if (indexOfFriend === e.index)
            prevIndexOfFriendRef.current = indexOfFriend - 1;
        else
            prevIndexOfFriendRef.current = indexOfFriend;
        setIndexOfFriend( e.index);
    }

    function handleClickFriendMenuLeaderBrd( e : {name : string, index: number}) : void {
        setOpenFriendMenuLeaderBrd(true);
        setNameOfFriend(e.name);
        if (indexOfFriend === e.index)
            prevIndexOfFriendMenuLeaderBordRef.current = indexOfFriend - 1;
        else
            prevIndexOfFriendMenuLeaderBordRef.current = indexOfFriend;
        setIndexOfFriend(e.index);
    }


    function close() :void {
        if (openPlayButton)
            setOpenPlayButton(!openPlayButton);
        if (openFriendMenu && indexOfFriend !== prevIndexOfFriendRef.current)
        {
            console.log(indexOfFriend);
            console.log(prevIndexOfFriendRef.current);
            setOpenFriendMenu(!openFriendMenu);
        }
            
        if (openFriendMenuLeaderBrd && indexOfFriend !== prevIndexOfFriendMenuLeaderBordRef.current)
            setOpenFriendMenuLeaderBrd(!openFriendMenuLeaderBrd);
    }    

    for (let i = 0; i < 22; i++)
    {
        friendList.push(<FriendEntity url={`/avatar/avatar-${Math.floor(Math.random() * 19) + 1}.png`}  name={'name' + (i + 1).toString()} status='status' key={i} index={i}  handleClick={handleClickFriendMenu} />);
        matchList.push(<MatchEntity url1={`/avatar/avatar-${Math.floor(Math.random() * 19) + 1}.png`} url2={`/avatar/avatar-${Math.floor(Math.random() * 19) + 1}.png`} name={'name' + (i + 1).toString()} score={5} key={i} />);
        leaderboard.push(<LeaderboardEntity url={`/avatar/avatar-${Math.floor(Math.random() * 19) + 1}.png`}  name={'name' + (i + 1).toString()} level={420} rank={i + 1} status='status' key={i} handleClick={handleClickFriendMenuLeaderBrd}/>)
    }

    return (
        <div onClick={()=>close()} >
            <TopBar/>
            <div className='illustration d-none d-lg-block'></div>
            <div className='container ' > 
                    <div className='row'>
                        <div className='col-12  d-none d-lg-block'>
                            <h3 className='title'>Ft_Transcendence</h3>
                        </div>
                        <div className='col-12 d-block d-lg-none'>
                            <h3 className='title small d-block d-lg-none'>Ft_Transcendence</h3>
                        </div>
                    </div>
                    <div className='row'>
                        
                        <div className={openPlayButton ? 'col-12 col-lg-3 offset-lg-4' : 'col-12'}>
                            <PlayButton handleClick={handleClickPlayButton} open={openPlayButton}/>
                        </div>
                        {openPlayButton ? 
                        <div className='col-10 offset-1 offset-xl-0 offset-lg-1 col-lg-3 offset-xl-1 '>
                            <div className='playMenuContainer d-block d-lg-none'>
                                <PlayMenu/>
                            </div> 
                            <div className='playMenuContainer marge_top d-none d-lg-block'>
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
                            <h3 className='text'>These guy are the best pong player of the world ... we are so pround of them !!</h3>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-10 offset-1'>
                            <ArrayDoubleColumn title='leaderboard' list={leaderboard} open={openFriendMenuLeaderBrd}  name={nameOfFriend} index={indexOfFriend}/>
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