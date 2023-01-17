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
import User , { initUser, UserBack } from '../../interface/UserInterface';

import Link from 'next/link';
import ChatBar from '../chatBar/chatBar';
import playButtonStyles from 'styles/playButton.module.scss';
import textStyles from 'styles/text.module.scss';
import styles from 'styles/home.module.scss';

//temporary before the login page
var user_id ='0dd12bbf-3e65-4635-8225-7a50cdd35dd3';

function Home() : JSX.Element {
    let matchList : JSX.Element[] = [];
    let leaderboard : JSX.Element[] = [];
    const [openPlayButton, setOpenPlayButton] = useState(false);
    const [openFriendMenu, setOpenFriendMenu] = useState(false);
    const [openFriendMenuLeaderBrd, setOpenFriendMenuLeaderBrd] = useState(false);
    const [friend, setFriend] = useState(initUser)
    const [indexOfFriend, setIndexOfFriend] = useState(0);
    const [friendList, setFriendList] = useState([<FriendEntity small={false} del={false} user={{id:'-1', avatar_num:1, status:'', name :'', victory: 0, defeat:0}}  key={0} index={0}  handleClick={handleClickFriendMenu} delFriendClick={()=>{}}/>]);

    const prevIndexOfFriendRef = useRef(0);
    const prevIndexOfFriendMenuLeaderBordRef = useRef(0);
    const friendListRef = useRef([<></>]);

    //get user info end dispatch them in the redux store
    const dispatch = useDispatch();
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/user?user_id=${user_id}`)
        .then(function(response){return response.json()})
        .then((data)=>{
            dispatch(setUserState(
                {
                    id: data.id,
                    name: data.name,
                    avatar_num: 6,
                    status: 'Store Ok',
                    victory: 1000,
                    defeat: 70
                }))
        })
        .catch(function(error){
            console.log(`probleme with fetchaa: ${error.message}`);
        });
    },[dispatch])


     /*======for close topBar component when click on screen====*/
     const [openToggle, setOpenToggle] = useState(false);
     const [openProfil, setOpenProfil] = useState(false);
     const [openUserList, setOpenUserList] = useState(false);
     const [searchBarUser, setSearchBarUser] = useState(initUser);
     const prevsearchBarUser = useRef({id:'-1', name:'', avatar_num:1, status:'', victory: 0, defeat:0});

 
     function clickTopBarToggle(){
         setOpenToggle(!openToggle);
     }
     
     function clickTopBarProfil (){
         setOpenProfil(!openProfil);
     }
     
     function writeSearchTopBar(e : boolean , user? : User){
         setOpenUserList(e);
         if (typeof user !== 'undefined')
         {
             setSearchBarUser(user);
             prevsearchBarUser.current = searchBarUser;
         }
     }
     /*==========================================================*/



    function handleClickPlayButton() : void {
        setOpenPlayButton(!openPlayButton);
    }

    function handleClickFriendMenu( e : {user : User, index: number}) : void {
        setOpenFriendMenu(true);
        setFriend(e.user);
        setFriendList([...friendListRef.current]);
        setIndexOfFriend(e.index);
        if (indexOfFriend === e.index)
            prevIndexOfFriendRef.current = indexOfFriend - 1;
        else
            prevIndexOfFriendRef.current = indexOfFriend;
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
        if (openFriendMenu && indexOfFriend != prevIndexOfFriendRef.current)
        {
            setOpenFriendMenu(!openFriendMenu);
            setFriendList([...friendListRef.current]);
        }
        if (openFriendMenuLeaderBrd && indexOfFriend !== prevIndexOfFriendMenuLeaderBordRef.current)
            setOpenFriendMenuLeaderBrd(!openFriendMenuLeaderBrd);
        if (openProfil)
            setOpenProfil(false);
        if (openUserList && prevsearchBarUser.current.id !== searchBarUser.id)
            setOpenUserList(false);
        
    }

    function delFriendClick(e : {idToDelete: string}){
        
        const data = {
            user_id : user_id,
            userToDelete_id: e.idToDelete
        }
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/friendships`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).catch(function(error) {
            console.log('Il y a eu un problème avec l\'opération fetch : ' + error.message);
        });

        friendListRef.current = friendListRef.current.filter(el => el.props.user.id !== e.idToDelete);
        setFriendList([...friendListRef.current]);
    }


    //get the friend list of the user
    useEffect(()=>{
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/friendships?user_id=${user_id}`).then(function(response){
            if (response.ok)
            {
                return (response.json().then(function(json){
                    let friendListTmp : JSX.Element[] = [];
                    json.map((e : UserBack , i : number)=> {
                        let key = i;
                        let user = {
                            id:`${e.id}`,
                            avatar_num: i + 1,
                            status:( i % 2) === 0 ? 'onligne' : 'outligne',
                            name :`${e.name}`,
                            victory: Math.floor(Math.random() * 1000),
                            defeat: Math.floor(Math.random() * 1000)
                        };
                        let friendEntity = <FriendEntity small={false} del={true} user={user}  key={key} index={i}  handleClick={handleClickFriendMenu} delFriendClick={delFriendClick}/>; 
                        friendListTmp.push(friendEntity);
                    });
                    setFriendList([...friendListTmp]);
                    friendListRef.current = friendListTmp;
                }));
            }
        }).catch(function(error) {
            console.log('Il y a eu un problème avec l\'opération fetchiii : ' + error.message);
        });
    },[]);


    for (let i = 0; i < 19; i++)
    {
        matchList.push(<MatchEntity url1={`/avatar/avatar-${i + 2}.png`} url2={`/avatar/avatar-${i + 1}.png`} name={'name' + (i + 1).toString()} score={5} key={i} />);
        leaderboard.push(<LeaderboardEntity  user={{id:`${i + 1}`, avatar_num: i + 1, status:(i % 2) === 0 ? 'onligne' : 'outligne', name : 'name' + (i + 1).toString(), victory: Math.floor(Math.random() * 1000), defeat: Math.floor(Math.random() * 1000)} } level={420} rank={i + 1} key={i} handleClick={handleClickFriendMenuLeaderBrd}/>)
    }

    return (
        <div onClick={()=>close()} id={'top'} >
            <TopBar openProfil={openProfil} openToggle={openToggle} openUserList={openUserList} clickTopBarProfil={clickTopBarProfil} clickTopBarToggle={clickTopBarToggle} writeSearchTopBar={writeSearchTopBar}/>
            <div className={`${styles.illustration} d-none d-lg-block`}></div>
            <div className='container ' > 
                    <div className='row'>
                        <div className='col-12  d-none d-lg-block'>
                            <h3 className={styles.title}>Ft_Transcendence</h3>
                        </div>
                        <div className='col-12 d-block d-lg-none'>
                            <h3 className={`${styles.title} ${styles.small} d-block d-lg-none`}>Ft_Transcendence</h3>
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
                            <div className={`d-none d-lg-block ${playButtonStyles.playMenuContainer} ${playButtonStyles.marge_top} `}>
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
                            <h3 className={`${styles.text} ${textStyles.laquer}`}>These guy are the best pong player of the world ... we are so pround of them !!</h3>
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