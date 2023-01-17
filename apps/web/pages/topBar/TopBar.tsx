import React , {useRef, useEffect, useState} from 'react';
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
import User, { initUser , UserBack} from '../../interface/UserInterface';

interface propsTopBar  {
    openToggle : boolean,
    openProfil: boolean,
    openUserList: boolean,
    clickTopBarToggle : ()=>void,
    clickTopBarProfil : ()=>void,
    writeSearchTopBar : (e : boolean, user? : User)=>void,
}

function TopBar(props : propsTopBar): JSX.Element {

    const [openUserMenu, setOpenUserMenu] = useState(false);
    const [value, setValue] = useState('');
    const [user, setUser] = useState(initUser);
    const [indexOfUser, setIndexOfUser] = useState(0);
    const [userList, setUserList] = useState([<></>]);

    const UserState = useSelector(selectUserState);

    function clickToggle(){
        props.clickTopBarToggle();
        if (!props.openToggle && props.openProfil)
            props.clickTopBarProfil();
        if (props.openProfil)
            props.clickTopBarProfil();
    }

    function clickProfil(){
        props.clickTopBarProfil();
    }

    function clickSearchBar(){
        if (value.length)
            props.writeSearchTopBar(true);
        else
            props.writeSearchTopBar(false);
        setOpenUserMenu(false);
    }

    function changeValue(val : string){
        setValue(val);
        if (!val.length)
        {
            props.writeSearchTopBar(false);
            setOpenUserMenu(false);
        }
        else
        {
            props.writeSearchTopBar(true);
        }     
    }

    useEffect(()=>{
        if (value.length)
        {
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/search?letters=${value}`).then(function(response){
                response.json().then(function(json){
                    let userListTmp : JSX.Element[] = [];
                    json.map((e : UserBack, i : number) => {
                        let user = {
                            id:`${e.id}`,
                            avatar_num:i + 1,
                            status:(i % 2) === 0? 'outligne': 'inligne',
                            name :`${e.name}`,
                            victory: Math.floor(Math.random() * 1000),
                            defeat:Math.floor(Math.random() * 1000)
                        }
                        let userEntity = <FriendEntity small={true} del={false} user={user}  key={i} index={i}  handleClick={handleClickUserMenu} delFriendClick={()=>{}} />;
                        userListTmp.push(userEntity);
                    });
                    setUserList([...userListTmp]);
                });
            }).catch(function(error) {
                console.log('Il y a eu un problème avec l\'opération fetch : ' + error.message);
            });
        }

    }, [value, userList]);

    function handleClickUserMenu( e : {user : User, index: number}) : void {
        setOpenUserMenu(true);
        setUser(e.user);
        setIndexOfUser(e.index);
        props.writeSearchTopBar(true, e.user);
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
                        <input type={'text'} placeholder={'Search someone...'} className={styles.searchBar}  value={value} onClick={clickSearchBar} onChange={(e)=> changeValue(e.target.value)}/>
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
                    {!props.openToggle ? 
                    <Image alt='toggle' src={ToggleBar} width={35} height={35}/> :
                    <Image alt='toggle' src={ToggleCross} width={35} height={35}/>}
                </div>
                {props.openToggle?
                <div>
                    <div className={`${styles.elementTopBar} ${styles.toggle} ${styles.menu}`}>
                        <div>
                            <Image alt='search' src={Search} width={15} height={15} className={styles.logoSearchBar} />
                            <input type={'text'} placeholder={'Search someone...'} className={`${styles.searchBar}  ${styles.toggle}`} value={value} onClick={clickSearchBar} onChange={(e)=> changeValue(e.target.value)}/>
                        </div>
                        <div className='fill small'>
                            <Image alt='avatar' src={`/avatar/avatar-${UserState.avatar_num}.png`} width={42} height={42} onClick={clickProfil}/>
                        </div>
                    </div>
                </div>

                : ''
                }
            </div>
            {props.openProfil? 
            <div className={props.openToggle? `${styles.elementTopBar}  ${styles.toggle}  ${styles.avatarMenu}  ${styles.open}` : `${styles.elementTopBar}  ${styles.toggle}  ${styles.avatarMenu}`}>
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
            {props.openUserList ?
            <div  className={`${styles.searchContainer} ${props.openToggle? styles.toggle : ''}`}>
                <div className='card small d-none d-md-block' >
                    <List list={userList} title={''} open={openUserMenu} user={user} index={indexOfUser}/>
                </div>
                <div className='card xsmall d-block d-md-none' >
                    <List list={userList} title={''} open={openUserMenu} user={user} index={indexOfUser}/>
                </div>
            </div>
            :<></>}
        </div>
    );
}

export default TopBar;