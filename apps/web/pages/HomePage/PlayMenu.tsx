import React, {useState} from 'react';
import styles from 'styles/playButton.module.scss';
import textStyle from 'styles/text.module.scss';


export default function PlayMenu() : JSX.Element{
    return (
        <div>
            <div className={`${styles.playMenuEntity} ${styles.bar}`}>
                <h3 className={textStyle.laquer}>Training</h3>
                <p className={textStyle.saira}>Play against a wall to practice aiming the ball.</p>
            </div>
            <div className={styles.playMenuEntity}>
                <h3 className={textStyle.laquer}>Battle royale</h3>
                <p className={textStyle.saira}>Play against 100 other players. Be the last one, be the best one!</p>
            </div>
        </div>
    );
}