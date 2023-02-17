import Link from "next/link"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { Conversation as ConversationEntity, conversationRestrictionEnum, ConversationRole } from "types"
import { selectUserState } from "../store/UserSlice"
import ManageConversation from "./manageConversation"
import { useWebsocketContext } from "./Websocket"

interface chatParamsProps
{
    currentConversation: ConversationEntity,
    selectConversation: Dispatch<SetStateAction<ConversationEntity | null>>
}
export default function ChatParams( props : chatParamsProps ) : JSX.Element
{
    const websockets = useWebsocketContext()
    const [ participants, setParticipants ] = useState<ConversationRole[]>([])
    const self = useRef<ConversationRole | null>(null)
    const userState = useSelector(selectUserState);

    useEffect(() =>
    {
        if (websockets.conversations?.connected && participants.length === 0)
        {
            websockets.conversations.emit("getParticipants", { id: props.currentConversation.id }, ( roles: ConversationRole[]) =>
            {
                setParticipants((prev) => {
                    const tmp = [...prev, ...roles]
                    self.current = tmp.filter((e)=> e.user.id === userState.id)[0]
                    return tmp
                })
            }
            )
        }
    }, [ participants ])
    
    return (
        <>
            { props.currentConversation.groupConversation ? < ManageConversation selectConversation={ props.selectConversation } currentConversation={ props.currentConversation } self={self} /> : <></>}
            <section>
            { props.currentConversation.groupConversation ? <h4>Participants</h4> : <></> }
            { participants.map((participant) => 
            {
                if (participant.user.id === userState.id)
                    return <></>
                if (!props.currentConversation.groupConversation)
                {
                    return <article><Link href={`/profile/${participant.user.name}`}>{ participant.user.name }</Link></article>
                }
                else if (! participant.restrictions.length)
                    return <><article>{ participant.user.name }</article><article>{ participant.role }</article></>
                return <><article>{ participant.user.name }</article><article>{ participant.role }</article>{ participant.restrictions.filter((e) => e.status === conversationRestrictionEnum.BAN).length ? "BANNED" : "MUTED" }</>
            })
            }
            </section>
        </>
    )
}