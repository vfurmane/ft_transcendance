import { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { Conversation as ConversationEntity, ConversationRole, ConversationRoleEnum } from "types"
import { selectUserState } from "../store/UserSlice"
import { useWebsocketContext } from "./Websocket"

interface manageConversationProps
{
    currentConversation: ConversationEntity,
    selectConversation: Dispatch<SetStateAction<ConversationEntity | null>>,
    self: MutableRefObject<ConversationRole | null>
}

export default function ManageConversation( props : manageConversationProps): JSX.Element
{
    const websockets = useWebsocketContext()
    return (
        <>
        { (props.self.current && props.self.current.role === ConversationRoleEnum.OWNER && props.currentConversation.conversationRoles.length > 1 ) ? <article>Leave (pick a new owner if you want to leave)</article> : <article onClick={() =>{
            if (websockets.conversations?.connected)
            {
                websockets.conversations.emit("leaveConversation", {id: props.currentConversation.id }, () => {
                    props.selectConversation(null)
                })
            }
        }}>Leave</article> }
        <article>Invite someone</article>
        </>
    )
}