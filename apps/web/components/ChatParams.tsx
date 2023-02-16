import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Conversation as ConversationEntity, ConversationRole } from "types"
import { useWebsocketContext } from "./Websocket"

interface chatParamsProps
{
    currentConversation: ConversationEntity
}
export default function ChatParams( props : chatParamsProps ) : JSX.Element
{
    const websockets = useWebsocketContext()
    const [ participants, setParticipants ] = useState<ConversationRole[]>([])

    useEffect(() =>
    {
        if (websockets.conversations?.connected)
        {
            websockets.conversations.emit("getParticipants", { id: props.currentConversation.id }, ( roles: ConversationRole[]) =>
            {
                setParticipants(roles)
            }
            )
        }
    }, [ participants ])
    
    return (
        <>
            <h4>Participants</h4>
            <section>
            { participants.map((participant) => 
            {
                if (!props.currentConversation.groupConversation)
                    return <article><Link href={`/profile/${participant.user.name}`}>{ participant.user.name }</Link></article>
                else if (! participant.restrictions.length)
                    return <><article><Link href={`/profile/${participant.user.name}`}>{ participant.user.name }</Link></article><article>{ participant.role }</article></>
                return <><article><Link href={`/profile/${participant.user.name}`}>{ participant.user.name }</Link></article><article>{ participant.role }</article></>
            })
            }
            </section>
        </>
    )
}