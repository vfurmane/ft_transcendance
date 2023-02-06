import { useEffect, useState } from "react"
import { ConversationsDetails, ConversationWithUnread } from "types"
import { useWebsocketContext } from "./Websocket"

export default function Chat( { conversationId } : {conversationId : string}) : JSX.Element
{
    const [conversationSelected, selectConversation] = useState(null)
    const [conversationList, setConversationList] = useState<ConversationWithUnread[]>([])
    const websockets = useWebsocketContext()

    useEffect(() =>
    {
        if (!conversationSelected)
        {
            if (websockets.conversations?.connected)
            {
                websockets.conversations.emit("getConversations", (conversationDetails : ConversationsDetails) =>
                {
                    setConversationList(conversationDetails.conversations)
                })
                websockets.conversations.on("newMessage", (message) =>
                {
                    const conversation = conversationList.filter((e) => e.conversation.id === message.id)
                    const remainder = conversationList.filter((e) => e.conversation.id !== message.id)
                    setConversationList([...conversation, ...remainder])
                })
            }
        }
    })

    return (
        <section className="conversationsContainer"><h1>Hi</h1></section>
    )
}