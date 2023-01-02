import React from 'react';
import Image from 'next/image'
import Logo from '../asset/Logo.png';
import Avatar from '../asset/Avatar.png';
import Search from '../asset/Search.png';

function TopBar() : JSX.Element {

    return (
        <div className='containerTopBar'>
            <div className='elementTopBar'>
                <Image  alt='logo' src={Logo} width={170} height={20}  />
                <a className='leaderBoardLink' href='/leaderbord'>Learderbord</a>
            </div>
            <div className='elementTopBar'>
                <div >
                    <Image alt='search' src={Search} width={15} height={15} className='logoSearchBar' />
                    <input type={'text'} placeholder={'Search someone...'} className='searchBar' />           
                </div>
                <Image  alt='avatar' src={Avatar} width={42} height={42} className='avatar' />
            </div>
        </div>
    );
}

export default TopBar;