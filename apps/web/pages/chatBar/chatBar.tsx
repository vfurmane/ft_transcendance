import React , {use, useEffect, useState} from 'react';
import styles from "styles/chatBar.module.scss";
import textStyles from 'styles/text.module.scss';


export default function ChatBar() : JSX.Element {
    return (
        <div className={styles.containerChatBar}>
            <h3 className={textStyles.laquer}>Chat</h3>
        </div>
    );
}