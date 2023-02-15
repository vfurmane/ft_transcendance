import { useState } from "react";
import { useSelector } from "react-redux";
import { Conversation as ConversationEntity, ConversationRole } from "types";
import { selectUserState } from "../store/UserSlice";
import styles from "styles/conversationControls.module.scss";
import Image from "next/image";
import ToggleBar from "../public/toggleBar.png";

interface conversationControlsProps
{
    newConversation: {userId: string, userName: string} | null,
    conversation: ConversationEntity | null
}

export default function ConversationControls( props : conversationControlsProps ) : JSX.Element
{
    const [ menuVisibility, setMenuVisibility ] = useState<boolean>(false)
    const userState = useSelector(selectUserState);

    if (!menuVisibility)
    {
        return (
            <>
            <p className={ styles.conversationName }>
                { props.conversation ? props.conversation.name.replace(userState.name, '').replace(' - ', '') : props.newConversation?.userName }
            </p>
            <section className={ styles.conversationMenu } onClick={ () => {setMenuVisibility(true)} }>
                < Image src={ ToggleBar } alt="toggle bar" />
            </section>
            </ >
        )
    }
    return (
        <>
        <p className={ styles.conversationName }>
            { props.conversation ? props.conversation.name.replace(userState.name, '').replace(' - ', '') : props.newConversation?.userName }
        </p>
        <section className={ styles.conversationMenu } onClick={ () => {setMenuVisibility(false)} }>
            < Image src={ ToggleBar } alt="toggle bar" />
        </section>
        <section>Useless</section>
        </ >
    )
}