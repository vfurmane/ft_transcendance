import React, { useState } from "react";
import Image from 'next/image';
import Connect from '../../public/statusConnect.png'
import RemoveFriend from '../../public/RemoveFriend.png';
import User from "../../interface/UserInterface";
import styles from 'styles/entity.module.scss';
import textStyles from 'styles/text.module.scss';


export default function FriendEntity (props : {user : User, key: number, index: number, del: boolean, small: boolean, handleClick: (e : {user: User, index: number})=>void, delFriendClick:(e : {idToDelete : string})=>void}): JSX.Element {
    if (typeof props.user === 'undefined')
        return <></>;
    return (
        <div className={styles.shadowContainer}>
            <div className={`${styles.entityContainer} ${styles.entity}  ${props.small? styles.small : ''}`}>
                <div className={styles.imageText} onClick={()=>props.handleClick({user: props.user, index:props.index})}>
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
                    <div className={styles.supr} onClick={()=>{props.delFriendClick({idToDelete: props.user.id})}}></div>
                :<></>}
            </div>
            <div className={`${styles.entityShadow}  ${props.small? styles.small : ''} d-none d-sm-block`}></div>
        </div>
    );
}