import React from "react";
import Image, { StaticImageData } from 'next/image';
import textStyle from 'styles/text.module.scss';
import styles from 'styles/entity.module.scss';

export default function MatchEntity(props : {name : string, score: number, key: number, url1: string | StaticImageData,  url2: string | StaticImageData}) : JSX.Element {
    return (
        <div className={styles.shadowContainer}>
            <div className={`${styles.entityContainer} ${styles.entity} ${styles.big}`}>
                <div className={`${styles.entityContainer} ${styles.start}`}>
                    <div className='fill small'>
                        <Image  alt='avatar' src={props.url1} width={47} height={47} />
                    </div>
                    <div className={styles.entityText}>
                        <h3 className={textStyle.laquer}>{props.name}</h3>
                        <p className={textStyle.saira} style={{textAlign:'center'}}>{props.score}</p>
                    </div>
                </div>
                <span>VS</span>
                <div className={`${styles.entityContainer} ${styles.end}`}>
                    <div className={styles.entityText}>
                        <h3 className={textStyle.laquer}>{props.name}</h3>
                        <p className={textStyle.saira} style={{textAlign:'center'}}>{props.score}</p>
                    </div>
                    <div className='fill small'>
                        <Image  alt='avatar' src={props.url2} width={47} height={47} />
                    </div>
                    
                </div>
            </div>
            <div className={`${styles.entityShadow} ${styles.big} d-none d-sm-block`}></div>
        </div>
    );
}