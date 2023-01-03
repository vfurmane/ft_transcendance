import React , {useState} from 'react';
import Image from 'next/image'
import Logo from '../asset/Logo.png';
import Avatar from '../asset/Avatar.png';
import Search from '../asset/Search.png';
import ToggleBar from '../asset/toggleBar.png';
import ToggleCross from '../asset/toggleCross.png';

function TopBar(props : {clickProfil : ()=>void, openProfil: boolean}): JSX.Element {

    const [openToggle, setOpenToggle] = useState(false);


    function clickToggle(){
        setOpenToggle(!openToggle);
        if (!openToggle && props.openProfil)
            props.clickProfil();
    }


    return (
        <div className='containerTopBar'>
            <div className='d-none d-md-block'>
                <div className='elementTopBar' >
                    <Image alt='logo' src={Logo} width={200} height={30} />
                    <a className='leaderBoardLink' href='/leaderbord'>Learderbord</a>
                </div>
            </div>
            <div className='d-none d-md-block '>
                <div className='elementTopBar'>
                    <div >
                        <Image alt='search' src={Search} width={20} height={20} className='logoSearchBar' />
                        <input type={'text'} placeholder={'Search someone...'} className='searchBar' />
                    </div>
                    <Image alt='avatar' src={Avatar} width={45} height={45} className='avatar' onClick={props.clickProfil}/>
                </div>
            </div>
            <div className='d-md-none'>
                <div className='elementTopBar' >
                    <Image alt='logo' src={Logo} width={170} height={20} />
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
                            <input type={'text'} placeholder={'Search someone...'} className='searchBar toggle' />
                        </div>
                        <Image alt='avatar' src={Avatar} width={42} height={42} className='avatar'  onClick={props.clickProfil}/>
                    </div>
                </div>

                : ''
                }
            </div>
            {props.openProfil? 
            <div className='elementTopBar toggle avatarMenu '>
                <div className='playMenuContainer'>
                    <div className='playMenuEntity bar'>
                        <h3>Profil</h3>
                    </div>
                    <div className='playMenuEntity'>
                        <h3>logout</h3>
                    </div>
                </div>
            </div>
            : ''
            }
        </div>
    );
}

export default TopBar;