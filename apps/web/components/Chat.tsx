import { useEffect, useState } from "react"
import { Conversation as ConversationEntity, ConversationsDetails, ConversationWithUnread, DMExists } from "types"
import Conversation from "./Conversation"
import OpenedConversation from "./OpenedConversation"
import { useWebsocketContext } from "./Websocket"
import styles from "styles/chat.module.scss";
import { useDispatch, useSelector } from "react-redux"
import { ReinitConversations, selectConversationsState } from "../store/ConversationSlice"
import Image from "next/image"
import back from "../public/back.png";

export default function Chat( { conversation } : { conversation : {userId: string, userName: string} }) : JSX.Element
{
    const [conversationSelected, selectConversation] = useState<ConversationEntity | null>(null)
    const [conversationList, setConversationList] = useState<ConversationWithUnread[]>([])
    const [newConversation, setNewConversation] = useState<{userId: string, userName: string}>(conversation)
    const [loading, setLoading] = useState(true);
    const websockets = useWebsocketContext();
    const conversationToOpen = useSelector(selectConversationsState)
    const dispatch = useDispatch()

    useEffect(() =>
    {
        if (conversationToOpen.userId.length)
        {
          setNewConversation(conversationToOpen)
          dispatch(ReinitConversations())
        }
    }, [conversationToOpen])

    useEffect(() =>
    {
        setLoading(true)
        console.error("Conversation selected: ", conversationSelected)
        if (newConversation.userId.length)
        {
            websockets.conversations?.emit("DMExists", {id: newConversation.userId} ,(DM : DMExists) => {
                console.error("DM exists", DM)
                console.error("user ID targeted: ", newConversation.userId)
                if (DM.conversationExists)
                {
                    selectConversation(DM.conversation)
                    setNewConversation(() => {return ({userId: "", userName: ""})})
                    setLoading(false)
                }
                else
                {
                    selectConversation(null)
                    setLoading(false)
                }
            })
        }
        else if (!conversationSelected && !newConversation.userId.length)
        {
            if (websockets.conversations?.connected)
            {
                websockets.conversations.emit("getConversations", (conversationDetails : ConversationsDetails) =>
                {
                    setConversationList(()  => conversationDetails.conversations)
                    setLoading(false)
                })
                websockets.conversations.on("newConversation", (conversation: ConversationEntity) =>
                {
                    setConversationList((list) => [{conversation : conversation, numberOfUnreadMessages: 1, lastMessage: conversation.created_at}, ...list])
                })
                websockets.conversations.on("newMessage", (message) =>
                {
                    const conversation = conversationList.filter((e) => e.conversation.id === message.id)
                    if (conversation)
                    {
                        conversation[0].numberOfUnreadMessages = conversation[0].numberOfUnreadMessages !== undefined ? conversation[0].numberOfUnreadMessages + 1 : 1;
                        const remainder = conversationList.filter((e) => e.conversation.id !== message.id)
                        setConversationList(() => [...conversation, ...remainder])
                    }
                })
            }
        }
        else
        {
            setLoading(false)
        }
        return (
            () => {
                websockets.conversations?.off("newConversation")
                websockets.conversations?.off("newMessage")
            }
        )
    }, [conversationSelected, newConversation])

    if (loading)
        return (<></>)

    if (newConversation.userId.length)
    {
        return (
            <>
            <article className={styles.backButton} onClick={ (e) => {
                selectConversation(null); setNewConversation({userId: "", userName: ""}); } 
            }>
            <Image alt="back" src={back} />
            </article>
            <section className={styles.conversationsContainer}>
                <OpenedConversation newConversation={newConversation} conversation={null} />
            </section>
            </>
        )
    }

    if (conversationSelected !== null)
    {
        return (
            <>
            <article className={styles.backButton} onClick={ (e) => {
                selectConversation(null); setNewConversation({userId: "", userName: ""}); } 
            }>
            <Image alt="back" src={back} />
            </article>
            <section className={styles.conversationsContainer}>
                <OpenedConversation newConversation={null} conversation={conversationSelected} />
            </section>
            </>
        )
    }
    if (!conversationList.length)
    {
        return (
            <section className={styles.conversationsContainer}><h3>No conversations yet</h3></section>
        )
    }
    return (
        <section className={styles.conversationsContainer}>
            {conversationList.map((conversation) => (
                <article key={`${conversation.conversation.id}_container`} onClick={() => { selectConversation(conversation.conversation) }}>
                <Conversation key={conversation.conversation.id} conversation={conversation}/>
                </article>
            ))
            }
        </section>
    )
}