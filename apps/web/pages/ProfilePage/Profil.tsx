import React, { useEffect, useRef, useState } from "react";
import TopBar from "../topBar/TopBar";
import { useRouter } from "next/router";
import Image from "next/image";
import MatchEntity from "../HomePage/MatchEntity";
import { selectUserState } from "../../store/UserSlice";
import { useSelector } from "react-redux";
import User, {initUser} from "../../interface/UserInterface";
import AchivementEntity from "./achivementEntity";
import Achivement ,{ initAchivement} from "../../interface/AchivementInterface";
import ChangePswrd from "./ChangePswrd";
import ChatBar from "../chatBar/chatBar";
import styles from 'styles/profil.module.scss';
import textStyles from 'styles/text.module.scss';

export default function Profil(): JSX.Element {
    let UserState = useSelector(selectUserState);
    const prevAchivementRef = useRef(initAchivement);
    const router = useRouter();
    const [user, setUser] = useState(initUser);
    const [openAchivementList, setOpenAchivementList] = useState(false);
    const [openAchivement, setOpenAchivement] = useState(false);
    const [achivementSelect, setAchivementSelect] = useState(initAchivement);
    const [userProfil, setUserProfil] = useState(false);
    const [openConfigProfil, setOpenConfigProfil] = useState(false);
    const [configProfil, setConfigProfil] = useState(<></>);


    /*======for close topBar component when click on screen====*/
    const [openToggle, setOpenToggle] = useState(false);
    const [openProfil, setOpenProfil] = useState(false);
    const [openUserList, setOpenUserList] = useState(false);
    const [searchBarUser, setSearchBarUser] = useState(initUser);
    const prevsearchBarUser = useRef({id:'-1', name:'', avatar_num: 1, status:'', victory: 0, defeat:0});

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


    let listOfMatch = [];
    let achivementList : JSX.Element[] = [];

    useEffect(() => {
        if (typeof router.query.user === 'string')
        {
            setUser(JSON.parse(router.query.user));
            if (JSON.parse(router.query.user).id === UserState.id)
                setUserProfil(true);
            else
                setUserProfil(false);
        }
    }, [router.query]);


    function achivementListClick(){
        setOpenAchivementList(true);
    }

    function achivementClick(e : {achivement: Achivement}){
        setOpenAchivement(true);
        setAchivementSelect(e.achivement);
        prevAchivementRef.current = achivementSelect;
    }

    function changePswrd(){
        setOpenConfigProfil(true);
        setOpenAchivementList(false);
        setConfigProfil(<ChangePswrd/>);
    }

    function close(){
        if (openAchivementList && prevAchivementRef.current !== achivementSelect)
            setOpenAchivementList(false);
        if (openAchivement && prevAchivementRef.current !== achivementSelect)
            setOpenAchivement(false);
        if (openProfil)
            setOpenProfil(false);
        if (openUserList && prevsearchBarUser.current.id !== searchBarUser.id)
            setOpenUserList(false);
    }

    for (let i = 0; i < 22; i++) {
        achivementList.push(<AchivementEntity achivement={{name:'achivement' + (i + 1).toString(), status:'done', description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Leo duis ut diam quam nulla. Et ligula ullamcorper malesuada proin libero nunc consequat. Tincidunt eget nullam non nisi est sit amet facilisis magna. Eu turpis egestas pretium aenean. Nunc consequat interdum varius sit amet. Cras adipiscing enim eu turpis egestas pretium. Integer eget aliquet nibh praesent. Ut sem viverra aliquet eget sit amet. Auctor augue mauris augue neque gravida in. Ut eu sem integer vitae. Viverra accumsan in nisl nisi scelerisque eu ultrices vitae auctor. Orci ac auctor augue mauris. Tempor id eu nisl nunc mi ipsum faucibus vitae.'}} key={i}  handleClick={achivementClick} />);
        listOfMatch.push(<MatchEntity url1={`/avatar/avatar-${Math.floor(Math.random() * 19) + 1}.png`} url2={`/avatar/avatar-${Math.floor(Math.random() * 19) + 1}.png`} name={'name' + (i + 1).toString()} score={5} key={i} />);
    }

    return (
        <div onClick={close} style={{width:'100vw', height:'100vh'}}>
            <TopBar openProfil={openProfil} openToggle={openToggle} openUserList={openUserList} clickTopBarProfil={clickTopBarProfil} clickTopBarToggle={clickTopBarToggle} writeSearchTopBar={writeSearchTopBar}/>
            <div className='container' style={{marginTop:'150px'}}>
                <div className='row'>
                    <div className={`col-10 offset-1 offset-md-0 offset-lg-1 col-md-2 ${styles.flexCenterColumn}`}>
                        <div className="fill">
                            <Image alt="avatar" src={`/avatar/avatar-${user.avatar_num}.png`} width={200} height={200} />
                        </div>
                        <p className={textStyles.saira} style={{color:'white'}}>{user.status}</p>
                    </div>
                    <div className={`col-10 offset-1  col-md-6 offset-lg-0  ${styles.profilMenuContainer}`}>
                        <div>
                            <h2 className={textStyles.pixel} style={{ color: 'white', fontSize: '40px', marginBottom: '10px' }}>{user.name}</h2>
                            <div className={styles.buttonAndBarContainer}>
                                <div style={{ width: '80%'}}>
                                    <div className={styles.flex_between}>
                                        <p className={textStyles.saira} style={{color:'white'}}>{user.victory} victory</p>
                                        <p className={textStyles.saira} style={{color:'white'}}>{user.defeat} defeat</p>
                                    </div>
                                    <div className={`${styles.flex_between} ${styles.statBar}`}>
                                        <div style={{height:'30px', backgroundColor: '#03cea4', width: `${Math.floor((user.victory / (user.defeat + user.victory)) * 100)}%` }}></div>
                                        <div style={{ height:'30px', backgroundColor: '#e22d44', width: `${Math.floor((user.defeat / (user.defeat + user.victory)) * 100)}%` }}></div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex'}}>
                                    <Image alt="achivement" src={`/achivement.png`} width={32} height={32} onClick={achivementListClick}/>
                                    <h3 className={textStyles.laquer} style={{ marginLeft: '10px' }}>10</h3>
                                </div>
                            </div>
                            {userProfil?
                            <div className={styles.buttonProfilContainer}>
                                <button className={styles.buttonProfil} onClick={changePswrd}><h3 className={textStyles.laquer} style={{ fontSize: '18px' }}>Change password</h3></button>
                                <button className={styles.buttonProfil}><h3 className={textStyles.laquer} style={{ fontSize: '18px' }}>Configure TFA</h3></button>
                                <button className={styles.buttonProfil}><h3 className={textStyles.laquer} style={{ fontSize: '18px' }}>Delete account</h3></button>
                            </div>:
                            <div className={styles.buttonProfilContainer}>
                                <button className={styles.buttonProfil} style={{width:'100px', height:'40px'}}><Image alt="addFriend" src={`/addFriend.png`} width={20} height={20}/></button>
                                <button className={styles.buttonProfil} style={{width:'100px'}}><Image alt="message" src={`/message.png`} width={20} height={20}/></button>
                                <button className={styles.buttonProfil} style={{width:'100px'}}><h3 className={textStyles.laquer} style={{ fontSize: '18px' }}>Play</h3></button>
                                <button className={styles.buttonProfil} style={{backgroundColor:'#e22d44', width:'100px'}} ><h3 className={textStyles.laquer} style={{ fontSize: '18px' }}>block</h3></button>
                            </div>}
                        </div>

                    </div>
                </div>
                <div className="row">
                    <div className="col-10 offset-1 col-lg-8" >
                         {!openAchivementList && !openConfigProfil? 
                         <div className='card' style={{ background: 'rgba(0,0,0,0)' }}> 
                            <h2 className={textStyles.pixel} >Match history</h2>
                            <div className="cardList">
                            {listOfMatch}
                            </div>
                        </div>
                        :
                        <div>
                            {openAchivementList?
                            <div style={{display:'flex'}}>
                                <div className='card' style={{ background: 'rgba(0,0,0,0)' }} >  
                                    <h2 className={textStyles.pixel}><Image alt="achivement" src={`/achivement.png`} width={32} height={32} onClick={achivementListClick}/> Achivement</h2>
                                    <div className="cardList">
                                        {achivementList}
                                    </div>
                                </div>
                                {openAchivement?
                                <div className='card' style={{ background: 'rgba(0,0,0,0)' }}> 
                                    <h3 className={textStyles.laquer}><Image alt="achivement" src={`/achivement.png`} width={32} height={32} onClick={achivementListClick}/>{achivementSelect.name}</h3>
                                    <div className="cardList">
                                        <p className={textStyles.saira}>{achivementSelect.description}</p>
                                    </div>
                                </div>: <></>
                                }
                            </div> : 
                            <div>
                                <p className={textStyles.saira} style={{color:'white', width: 'auto'}}><Image alt="cross" src={'/toggleCross.png'} width={20} height={20} onClick={()=>setOpenConfigProfil(false)}/> close</p>
                                {configProfil}
                            </div> }
                        </div>
                        }
                    </div>
                </div>
            </div>
            <ChatBar/>
        </div>

    );
}