import React, {useEffect, useRef, useState} from 'react';
import TopBar from '../topBar/TopBar';
import PlayButton  from './PlayButton';
import List  from './List';
import FriendEntity from './FriendEntity';
import MatchEntity from './MatchEntity';
import LeaderboardEntity from './LeaderboardEntity';
import ArrayDoubleColumn from './ArrayDoubleColumn';
import PlayMenu from './PlayMenu';
import { setUserState } from "../../store/UserSlice";
import { useDispatch } from "react-redux";
import User , { initUser } from '../../interface/UserInterface';
import Link from 'next/link';
import ChatBar from '../chatBar/chatBar';
import playButtonStyles from 'styles/playButton.module.scss';
import textStyles from 'styles/text.module.scss';





function Home() : JSX.Element {
    let friendList : JSX.Element[] = [];
    let matchList : JSX.Element[] = [];
    let leaderboard : JSX.Element[] = [];
    const [openPlayButton, setOpenPlayButton] = useState(false);
    const [openFriendMenu, setOpenFriendMenu] = useState(false);
    const [openFriendMenuLeaderBrd, setOpenFriendMenuLeaderBrd] = useState(false);
    const [friend, setFriend] = useState(initUser)
    const [indexOfFriend, setIndexOfFriend] = useState(0);

    const prevIndexOfFriendRef = useRef(0);
    const prevIndexOfFriendMenuLeaderBordRef = useRef(0);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setUserState(
            {
                id: 'store is working',
                name: 'maxence',
                avatar_num: 6,
                status: 'Store Ok',
                victory: 1000,
                defeat: 70
            }))
    },[dispatch])

    function handleClickPlayButton() : void {
        setOpenPlayButton(!openPlayButton);
    }

    function handleClickFriendMenu( e : {user : User, index: number}) : void {
        setOpenFriendMenu(true);
        setFriend(e.user);
        if (indexOfFriend === e.index)
            prevIndexOfFriendRef.current = indexOfFriend - 1;
        else
            prevIndexOfFriendRef.current = indexOfFriend;
        setIndexOfFriend( e.index);
    }

    function handleClickFriendMenuLeaderBrd( e : {user : User, index: number}) : void {
        setOpenFriendMenuLeaderBrd(true);
        setFriend(e.user);
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
        friendList.push(<FriendEntity del={true} user={{id:`${i + 1}`, avatar_num: Math.floor(Math.random() * 19) + 1, status:( Math.floor(Math.random() * 2)) === 0 ? 'onligne' : 'outligne', name : 'name' + (i + 1).toString(), victory: Math.floor(Math.random() * 1000), defeat: Math.floor(Math.random() * 1000)}}  key={i} index={i}  handleClick={handleClickFriendMenu} />);
        matchList.push(<MatchEntity url1={`/avatar/avatar-${Math.floor(Math.random() * 19) + 1}.png`} url2={`/avatar/avatar-${Math.floor(Math.random() * 19) + 1}.png`} name={'name' + (i + 1).toString()} score={5} key={i} />);
        leaderboard.push(<LeaderboardEntity  user={{id:`${i + 1}`, avatar_num: Math.floor(Math.random() * 19) + 1, status:( Math.floor(Math.random() * 2)) === 0 ? 'onligne' : 'outligne', name : 'name' + (i + 1).toString(), victory: Math.floor(Math.random() * 1000), defeat: Math.floor(Math.random() * 1000)} } level={420} rank={i + 1} key={i} handleClick={handleClickFriendMenuLeaderBrd}/>)
    }

    return (
        <div onClick={()=>close()} id={'top'} >
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
                            <div className={`{${playButtonStyles.playMenuContainer} d-block d-lg-none`}>
                                <PlayMenu/>
                            </div> 
                            <div className={`{${playButtonStyles.playMenuContainer} ${playButtonStyles.marge_top} d-none d-lg-block`}>
                                <PlayMenu/>
                            </div> 
                        </div>
                        : <></>}
                    </div>
                    <div className='row'>
                        <div className='col-10 offset-1 col-lg-4'>
                            <div className='card'>
                                 <List title='Friends List' list={friendList} open={openFriendMenu} user={friend} index={indexOfFriend}/>
                            </div>
                        </div>
                        <div className='col-10 offset-1  offset-lg-0 col-lg-6'>
                            <div className='card'>
                                 <List title='featuring' list={matchList} />
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-8 offset-2'>
                            <h3 className={`text ${textStyles.laquer}`}>These guy are the best pong player of the world ... we are so pround of them !!</h3>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-10 offset-1' id='leaderBoard'>
                            <ArrayDoubleColumn title='leaderboard' list={leaderboard} open={openFriendMenuLeaderBrd}  user={friend} index={indexOfFriend}/>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-4 offset-4'>
                            <Link href={'#top'} style={{ textDecoration:'none'}}><p className={textStyles.saira} style={{textAlign:'center', marginTop:'50px'}}>Go back to top</p></Link>
                        </div>
                    </div>
            </div>
            <ChatBar/>
        </div>  
    );
}

export default Home;