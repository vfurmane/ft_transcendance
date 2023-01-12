import React , {use, useEffect, useState} from 'react';
import Image from 'next/image'
import Logo from '../../public/Logo.png';
import Search from '../../public/Search.png';
import ToggleBar from '../../public/toggleBar.png';
import ToggleCross from '../../public/toggleCross.png';
import Link from 'next/link';
import { selectUserState } from "../../store/UserSlice";
import { useSelector } from "react-redux";
import FriendEntity from '../HomePage/FriendEntity';
import styles from 'styles/topBar.module.scss';
import textStyles from 'styles/text.module.scss';
import List from '../HomePage/List';
import User, { initUser } from '../../interface/UserInterface';

function TopBar(): JSX.Element {

    const [openToggle, setOpenToggle] = useState(false);
    const [openProfil, setOpenProfil] = useState(false);
    const [value, setValue] = useState('');
    const [user, setUser] = useState(initUser);
    const [openUserMenu, setOpenUserMenu] = useState(false);
    const [indexOfUser, setIndexOfUser] = useState(0);
    

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
        setValue(val);
        if (!val.length)
            setOpenUserMenu(false);
    }

    function handleClickUserMenu( e : {user : User, index: number}) : void {
        setOpenUserMenu(true);
        setUser(e.user);
        setIndexOfUser(e.index)
    }

    let friendList : JSX.Element[] = [];
    for (let i = 0; i < 22; i++)
    {
        friendList.push(<FriendEntity small={true} del={false} user={{id:`${i + 1}`, avatar_num: Math.floor(Math.random() * 19) + 1, status:( Math.floor(Math.random() * 2)) === 0 ? 'onligne' : 'outligne', name : 'name' + (i + 1).toString(), victory: Math.floor(Math.random() * 1000), defeat: Math.floor(Math.random() * 1000)}}  key={i} index={i}  handleClick={handleClickUserMenu} />);
    }

    return (
        <div className={styles.containerTopBar}>
            <div className='d-none d-md-block'>
                <div className={styles.elementTopBar} >
                    <Link href={'/HomePage/HomePage'}><Image alt='logo' src={Logo} width={200} height={30} /></Link>
                    <Link className={styles.leaderBoardLink} href='/HomePage/HomePage#leaderBoard'>Learderbord</Link>
                </div>
            </div>
            <div className='d-none d-md-block '>
                <div className={styles.elementTopBar}>
                    <div >
                        <Image alt='search' src={Search} width={20} height={20} className={styles.logoSearchBar} />
                        <input type={'text'} placeholder={'Search someone...'} className={styles.searchBar}  value={value} onChange={(e)=> changeValue(e.target.value)}/>
                    </div>
                    <div className='fill small'>
                        <Image alt='avatar' src={`/avatar/avatar-${UserState.avatar_num}.png`} width={45} height={45}  onClick={clickProfil}/>
                    </div>
                </div>
            </div>
            <div className='d-md-none'>
                <div className={styles.elementTopBar} >
                    <Link href={'/HomePage/HomePage'}><Image alt='logo' src={Logo} width={170} height={20} /></Link>
                </div>
            </div>
            <div className='d-md-none'>
                <div className={`${styles.elementTopBar}  ${styles.toggle}`} onClick={clickToggle} >
                    {!openToggle ? 
                    <Image alt='toggle' src={ToggleBar} width={35} height={35}/> :
                    <Image alt='toggle' src={ToggleCross} width={35} height={35}/>}
                </div>
                {openToggle?
                <div>
                    <div className={`${styles.elementTopBar} ${styles.toggle} ${styles.menu}`}>
                        <div>
                            <Image alt='search' src={Search} width={15} height={15} className={styles.logoSearchBar} />
                            <input type={'text'} placeholder={'Search someone...'} className={`${styles.searchBar}  ${styles.toggle}`} value={value} onChange={(e)=> changeValue(e.target.value)}/>
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
            <div className={openToggle? `${styles.elementTopBar}  ${styles.toggle}  ${styles.avatarMenu}  ${styles.open}` : `${styles.elementTopBar}  ${styles.toggle}  ${styles.avatarMenu}`}>
                <div className={styles.contextMenuContainer}>
                    <div className={`${styles.contextMenuEntity}  ${styles.bar}`}>
                    <Link href={{pathname:"/ProfilePage/Profil", query: {user : JSON.stringify(UserState)}} }style={{ textDecoration: 'none' }}><h3 className={textStyles.laquer}>profil</h3></Link>
                    </div>
                    <div className={styles.contextMenuEntity}>
                        <h3 className={textStyles.laquer}>logout</h3>
                    </div>
                </div>
            </div>
            : ''
            }
            {value.length !== 0 ?
            <div  className={`${styles.searchContainer} ${openToggle? styles.toggle : ''}`}>
                <div className='card small d-none d-md-block' >
                    <List list={friendList} title={''} open={openUserMenu} user={user} index={indexOfUser}/>
                </div>
                <div className='card xsmall d-block d-md-none' >
                    <List list={friendList} title={''} open={openUserMenu} user={user} index={indexOfUser}/>
                </div>
            </div>
            :<></>}
        </div>
    );
}

export default TopBar;