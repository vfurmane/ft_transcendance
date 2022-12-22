import React from 'react';
import Image from 'next/image'
import Logo from '../asset/logo.png';
import Avatar from '../asset/Avatar.png';
import Search from '../asset/Search.png';

function TopBar() : JSX.Element {

    let container = {
        width: '100vw',
        height: '80px',
        backgroundColor : 'rgba(0,0,0,0)',
        display: 'flex',
        justifyContent: 'space-between',
        
    }

    let elemts = {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        margin: '20px'
    }

    let styleInput = {
        borderTop: '0px',
        borderRight: '0px',
        borderLeft: '0px',
        borderBottom: 'solid white 1px',
        backgroundColor: 'rgba(0,0,0,0)'
    }


    return (
        <div style={container}>
            <div style={elemts}>
                <Image  alt='logo' src={Logo} width={170} height={20} style={{marginRight: '20px'}} />
                <a style={{color:'white', textDecoration:'none'}} href='/leaderbord'>Learderbord</a>
            </div>
            <div style={elemts}>
                <div >
                    <Image alt='search' src={Search} width={15} height={15} style={{position: 'absolute', marginLeft: '125px'}} />
                    <input type={'text'} placeholder={'Search someone...'}  style={styleInput} />           
                </div>
                <Image  alt='avatar' src={Avatar} width={42} height={42} style={{marginLeft: '30px'}} />
            </div>
            
        </div>
    );
}

export default TopBar;