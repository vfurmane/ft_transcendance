import { useEffect, useState } from "react"
import { Conversation as ConversationEntity, ConversationsDetails, ConversationWithUnread, DMExists } from "types"
import Conversation from "./Conversation"
import OpenedConversation from "./OpenedConversation"
import { useWebsocketContext } from "./Websocket"
import styles from "styles/chat.module.scss";

export default function Chat( { conversation } : { conversation : {userId: string, userName: string} }) : JSX.Element
{
    const [conversationSelected, selectConversation] = useState<ConversationEntity | null>(null)
    const [conversationList, setConversationList] = useState<ConversationWithUnread[]>([])
    const [newConversation, setNewConversation] = useState<{userId: string, userName: string}>(conversation)
    const websockets = useWebsocketContext()

    useEffect(() =>
    {
        console.error("Conversation selected: ", conversationSelected)
        if (newConversation.userId.length)
        {
            websockets.conversations?.emit("DMExists", {id: newConversation.userId} ,(DM : DMExists) => {
                if (DM.conversationExists)
                {
                    selectConversation(DM.conversation)
                    setNewConversation(() => {return ({userId: "", userName: ""})})
                }
            })
        }
        if (!conversationSelected && !newConversation.userId.length)
        {
            if (websockets.conversations?.connected)
            {
                websockets.conversations.emit("getConversations", (conversationDetails : ConversationsDetails) =>
                {
                    setConversationList(()  => conversationDetails.conversations)
                })
                websockets.conversations.on("newConversation", (conversation: ConversationEntity) =>
                {
                    setConversationList((list) => [{conversation : conversation, numberOfUnreadMessages: 1, lastMessage: conversation.created_at}, ...list])
                })
                websockets.conversations.on("newMessage", (message) =>
                {
                    const conversation = conversationList.filter((e) => e.conversation.id === message.id)
                    conversation[0].numberOfUnreadMessages += 1
                    const remainder = conversationList.filter((e) => e.conversation.id !== message.id)
                    setConversationList(() => [...conversation, ...remainder])
                })
            }
        }
        return (
            () => {
                websockets.conversations?.off("newConversation")
                websockets.conversations?.off("newMessage")
            }
        )
    }, [conversationSelected])

    if (newConversation.userId.length)
    {
        return (
            <section className="conversationsContainer">
                <OpenedConversation newConversation={newConversation} conversation={null} />
            </section>
        )
    }

    if (conversationSelected !== null)
    {
        return (
            <section className={styles.conversationsContainer}>
                <OpenedConversation newConversation={null} conversation={conversationSelected} />
            </section>
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