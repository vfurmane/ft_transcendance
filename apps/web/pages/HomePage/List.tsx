import React, { useState } from 'react';
import Image from 'next/image';
import Message from '../../public/message.png';
import Link from 'next/link';
import User from '../../interface/UserInterface';
import textStyle from 'styles/text.module.scss';
import styles from 'styles/entity.module.scss';


export default function List(props: { title: string, list: JSX.Element[], open?: boolean, user?: User, index?: number }): JSX.Element {

    if (props.open && typeof(props.index) !== 'undefined') {
    props.list[props.index] =   <div className={styles.shadowContainer}>
                                    <div className={`${styles.entityContainer} ${styles.entity} ${props.title.length === 0 ? styles.small : ''}`}>
                                        <button className={styles.buttonEntity}><Link href={{pathname:"../ProfilePage/Profil", query: {user: JSON.stringify(props.user)}} }style={{ textDecoration: 'none' }}><h3 className={textStyle.laquer}>profil</h3></Link></button>
                                        <button className={styles.buttonEntity}><Image alt='message' src={Message} width={30} height={30} /></button>
                                        <button className={styles.buttonEntity}><h3 className={textStyle.laquer}>Play</h3></button>
                                    </div>
                                    <div className={`${styles.entityShadow} ${props.title.length === 0 ? styles.small : ''} d-none d-sm-block`} ></div>
                                </div>
    }
    return (
        <div>
            {props.title.length?
            <h2 className={textStyle.pixel}>{props.title}</h2>:<></>}
            <div className='cardList'>
                {props.list}
            </div>
            
        </div>
           
       
    );
}