import React, { useState } from 'react';
import Image from 'next/image';
import Message from '../../public/message.png';
import Link from 'next/link';
import User from '../../interface/UserInterface';
import textStyle from 'styles/text.module.scss';
import styles from 'styles/entity.module.scss';


export default function List(props: { title: string, list: JSX.Element[], open?: boolean, user?: User, index?: number }): JSX.Element {

    if (props.open === true && typeof(props.index) !== 'undefined'  && typeof(props.title) === 'string') {
    props.list[props.index] =   <div className={styles.shadowContainer}>
                                    <div className={`${styles.entityContainer} ${styles.entity} ${props.title.length === 0 ? styles.small : ''}`}>
                                    <Link href={{pathname:"../ProfilePage/Profil", query: {user: JSON.stringify(props.user)}} } className={styles.buttonEntity}><h3 className={textStyle.laquer}>profil</h3></Link>
                                    <Link href={''} className={styles.buttonEntity}><Image alt='message' src={Message} width={30} height={30} /></Link>
                                    <Link href={''} className={styles.buttonEntity}><h3 className={textStyle.laquer}>Play</h3></Link>
                                    </div>
                                    <div className={`${styles.entityShadow} ${props.title.length === 0 ? styles.small : ''} d-none d-sm-block`} ></div>
                                </div>
    }
    return (
        <div>
            {typeof props.title === 'string' && props.title.length?
            <h2 className={textStyle.pixel}>{props.title}</h2>:<></>}
            <div className='cardList'>
                {props.list}
            </div>
            
        </div>
           
       
    );
}