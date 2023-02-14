import { Message as MessageEntity } from "types";
import styles from "styles/Message.module.scss";
import { useSelector } from "react-redux";
import { selectUserState } from "../store/UserSlice";

interface MessageProps
{
    message: MessageEntity
}

export default function Message ( props : MessageProps ) : JSX.Element {
    const userState = useSelector(selectUserState);
    console.error("Message loaded")
    if (props.message.system_generated)
    {
        return (
            <article className={`${styles.containerSystemMessage} ${styles.messageContent}`}>{ props.message.content }</article>
        )
    }
    else if (props.message.sender && props.message.sender.id !== userState.id)
    {
        return (
            <article className={styles.containerOtherMessage}><p className={styles.senderName}>{ props.message.sender?.name }</p><p className={styles.messageContent}>{ props.message.content }</p></article>
        )
    }
    else
    {
        return <article className={styles.containerSelfMessage}><p className={styles.messageContent}>{props.message.content}</p></article>
    }
}