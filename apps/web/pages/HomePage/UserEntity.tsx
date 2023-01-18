import React, { useState } from "react";
import Image from 'next/image';
import Connect from '../../public/statusConnect.png'
import RemoveFriend from '../../public/RemoveFriend.png';
import User from "../../interface/UserInterface";
import styles from 'styles/entity.module.scss';
import textStyles from 'styles/text.module.scss';
import Link from "next/link";
import Message from '../../public/message.png';


export default function UserEntity (props : {user : User, key: number, index: number, del: boolean, small: boolean, handleClick: (e : {index: number, openMenu: boolean, setOpenMenu : React.Dispatch<React.SetStateAction<boolean>>})=>void, delFriendClick:(e : {idToDelete : string, index: number})=>void}): JSX.Element {
    if (typeof props.user === 'undefined')
        return <></>;
    const [openMenu, setOpenMenu] = useState(false);

    if (openMenu)
    {
        return (
            <div className={styles.shadowContainer}>
                <div className={`${styles.entityContainer} ${styles.entity} ${props.small ? styles.small : ''}`}>
                <Link href={{pathname:"../ProfilePage/Profil", query: {user: JSON.stringify(props.user)}} } className={styles.buttonEntity}><h3 className={textStyles.laquer}>profil</h3></Link>
                <Link href={''} className={styles.buttonEntity}><Image alt='message' src={Message} width={30} height={30} /></Link>
                <Link href={''} className={styles.buttonEntity}><h3 className={textStyles.laquer}>Play</h3></Link>
                </div>
                <div className={`${styles.entityShadow} ${props.small ? styles.small : ''} d-none d-sm-block`} ></div>
            </div>
        
        );
    }

    return (
        <div className={styles.shadowContainer}>
            <div className={`${styles.entityContainer} ${styles.entity}  ${props.small? styles.small : ''}`}>
                <div className={styles.imageText} onClick={()=>props.handleClick({index:props.index, openMenu: openMenu, setOpenMenu:setOpenMenu})}>
                    <div className="fill small">
                        <Image  alt='avatar' src={`/avatar/avatar-${props.user.avatar_num}.png`} width={47} height={47} />
                    </div>
                    {props.user.status === 'onligne' ? <Image alt='status' src={Connect} width={20} height={20} className='statusImage'/>
                    : <div></div>}
                    <div className={styles.entityText}>
                        <h3 className={textStyles.laquer}>{props.user.name}</h3>
                        <p className={textStyles.saira}>{props.user.status}</p>
                    </div>
                </div>
                {props.del?
                    <div className={styles.supr} onClick={()=>{props.delFriendClick({idToDelete: props.user.id, index: props.index})}}></div>
                :<></>}
            </div>
            <div className={`${styles.entityShadow}  ${props.small? styles.small : ''} d-none d-sm-block`}></div>
        </div>
    );
}