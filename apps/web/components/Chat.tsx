import { useEffect, useState } from "react"
import { Conversation as ConversationEntity, ConversationsDetails, ConversationWithUnread, DMExists } from "types"
import Conversation from "./Conversation"
import OpenedConversation from "./OpenedConversation"
import { useWebsocketContext } from "./Websocket"

export default function Chat( { conversation } : { conversation : {userId: string, userName: string} }) : JSX.Element
{
    const [conversationSelected, selectConversation] = useState<ConversationEntity | {userId: string, userName: string} | null>(null)
    const [conversationList, setConversationList] = useState<ConversationWithUnread[]>([])
    const [newConversation, setNewConversation] = useState<boolean>(false)
    const websockets = useWebsocketContext()

    useEffect(() =>
    {
        if (websockets.conversations?.connected)
        {
            websockets.conversations.emit("getConversations", (conversationDetails : ConversationsDetails) =>
            {
                setConversationList(conversationDetails.conversations)
            })
            if (conversation.userId.length)
            {
                websockets.conversations.emit("DMExists", {id: conversation.userId} ,(DM : DMExists) => {
                    if (DM.conversationExists)
                    {
                        selectConversation(DM.conversation)
                        setNewConversation(false)
                    }
                    else
                    {
                        selectConversation(conversation)
                        setNewConversation(true)
                    }
                })
            }
        }
        if (!conversationSelected)
        {
            if (websockets.conversations?.connected)
            {
                websockets.conversations.on("newConversation", (conversation: ConversationEntity) =>
                {
                    setConversationList([{conversation : conversation, numberOfUnreadMessages: 1, lastMessage: conversation.created_at}, ...conversationList])
                })
                websockets.conversations.on("newMessage", (message) =>
                {
                    const conversation = conversationList.filter((e) => e.conversation.id === message.id)
                    conversation[0].numberOfUnreadMessages += 1
                    const remainder = conversationList.filter((e) => e.conversation.id !== message.id)
                    setConversationList([...conversation, ...remainder])
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

    if (conversationSelected !== null)
    {
        return (
            <section className="conversationsContainer">
                <OpenedConversation newConversation={newConversation} conversation={conversationSelected} />
            </section>
        )
    }
    if (!conversationList.length)
    {
        return (
            <section className="conversationContainer"><h3>No conversations yet</h3></section>
        )
    }
    return (
        <section className="conversationsContainer">
            {conversationList.map((conversation) => (
                <article onClick={() => { selectConversation(conversation.conversation); setNewConversation(false) }}>
                <Conversation key={conversation.conversation.id} conversation={conversation}/>
                </article>
            ))
            }
        </section>
    )
}