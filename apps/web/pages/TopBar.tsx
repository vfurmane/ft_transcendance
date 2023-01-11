import React , {use, useEffect, useState} from 'react';
import Image from 'next/image'
import Logo from '../public/Logo.png';
import Search from '../public/Search.png';
import ToggleBar from '../public/toggleBar.png';
import ToggleCross from '../public/toggleCross.png';
import Link from 'next/link';
import { selectUserState } from "../store/UserSlice";
import { useSelector } from "react-redux";
import User, { initUser } from '../interface/UserInterface';
import FriendEntity from './HomePage/FriendEntity';

function TopBar(): JSX.Element {

    const [openToggle, setOpenToggle] = useState(false);
    const [openProfil, setOpenProfil] = useState(false);
    const [value, setValue] = useState('');

    const UserState = useSelector(selectUserState);

    function clickToggle(){
        setOpenToggle(!openToggle);
        if (!openToggle && openProfil)
            clickProfil();
        if (openProfil)
            clickProfil();
    }

    function clickProfil(){
        setOpenProfil(!openProfil);
    }

    function changeValue(val : string){
        setValue(val)
        console.log(value);
    }

    let friendList : JSX.Element[] = [];
    for (let i = 0; i < 22; i++)
    {
        friendList.push(<FriendEntity del={false} user={{id:`${i + 1}`, avatar_num: Math.floor(Math.random() * 19) + 1, status:( Math.floor(Math.random() * 2)) === 0 ? 'onligne' : 'outligne', name : 'name' + (i + 1).toString(), victory: Math.floor(Math.random() * 1000), defeat: Math.floor(Math.random() * 1000)}}  key={i} index={i}  handleClick={(e)=>changeValue} />);
    }

    return (
        <div className='containerTopBar'>
            <div className='d-none d-md-block'>
                <div className='elementTopBar' >
                    <Link href={'/HomePage/HomePage'}><Image alt='logo' src={Logo} width={200} height={30} /></Link>
                    <Link className='leaderBoardLink' href='/HomePage/HomePage#leaderBoard'>Learderbord</Link>
                </div>
            </div>
            <div className='d-none d-md-block '>
                <div className='elementTopBar'>
                    <div >
                        <Image alt='search' src={Search} width={20} height={20} className='logoSearchBar' />
                        <input type={'text'} placeholder={'Search someone...'} className='searchBar'  value={value} onChange={(e)=> changeValue(e.target.value)}/>
                    </div>
                    <div className='fill small'>
                        <Image alt='avatar' src={`/avatar/avatar-${UserState.avatar_num}.png`} width={45} height={45}  onClick={clickProfil}/>
                    </div>
                </div>
            </div>
            <div className='d-md-none'>
                <div className='elementTopBar' >
                    <Link href={'/HomePage/HomePage'}><Image alt='logo' src={Logo} width={170} height={20} /></Link>
                </div>
            </div>
            <div className='d-md-none'>
                <div className='elementTopBar toggle' onClick={clickToggle} >
                    {!openToggle ? 
                    <Image alt='toggle' src={ToggleBar} width={35} height={35}/> :
                    <Image alt='toggle' src={ToggleCross} width={35} height={35}/>}
                </div>
                {openToggle?
                <div>
                    <div className='elementTopBar toggle menu'>
                        <div>
                            <Image alt='search' src={Search} width={15} height={15} className='logoSearchBar' />
                            <input type={'text'} placeholder={'Search someone...'} className='searchBar toggle' value={value} onChange={(e)=> changeValue(e.target.value)}/>
                        </div>
                        <div className='fill small'>
                            <Image alt='avatar' src={`/avatar/avatar-${UserState.avatar_num}.png`} width={42} height={42} onClick={clickProfil}/>
                        </div>
                    </div>
                </div>

                : ''
                }
            </div>
            {openProfil? 
            <div className={openToggle? 'elementTopBar toggle avatarMenu open' : 'elementTopBar toggle avatarMenu'}>
                <div className='playMenuContainer'>
                    <div className='playMenuEntity bar'>
                    <Link href={{pathname:"/ProfilePage/Profil", query: {user : JSON.stringify(UserState)}} }style={{ textDecoration: 'none' }}><h3>profil</h3></Link>
                    </div>
                    <div className='playMenuEntity'>
                        <h3>logout</h3>
                    </div>
                </div>
            </div>
            : ''
            }
            {value.length !== 0 ?
            <div style={{position:'absolute', zIndex:'99', top:'52px', right: '117px', width:'250px'}}>
                <div className='card'>
                    <div className='cardList'>
                        {friendList}
                    </div>
                </div>
            </div>
            :<></>}
        </div>
    );
}

export default TopBar;