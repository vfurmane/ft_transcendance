import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Socket } from "socket.io-client";
import { Conversation as ConversationEntity, conversationRestrictionEnum, ConversationRole, ConversationRoleEnum } from "types";
import ToggleCross from "../public/toggleCross.png";
import { useWebsocketContext } from "./Websocket";

interface ConversationParticipantsProps
{
    participant: ConversationRole,
    self: ConversationRole | null,
    conversation: ConversationEntity
}

export default function ConversationParticipant(props: ConversationParticipantsProps)
{
    const websockets = useWebsocketContext()
    const [ showOptions, setShowOptions ] = useState<boolean>(false)
    const [ error, setError ] = useState<string>("")
    const [ success, setSuccess ] = useState<string>("")

    const promoteUser = (newRole : ConversationRoleEnum, promote: boolean) =>
    {
        setError("")
        setSuccess("")
        if (!websockets.conversations?.connected)
        {
            setError("Temporary network error, please try again later")
            return
        }
        websockets.conversations.timeout(1000).emit("updateRole", { id: props.conversation.id, userId: props.participant.user.id, newRole: newRole}, (err: any, answer: string ) => {
        if (err)
        {
            if (promote)
                setError(`Failed to promote ${props.participant.user.name} as ${newRole}`)
            else
                setError(`Failed to demote ${props.participant.user.name} as ${newRole}`)
            return
        }
        setSuccess(answer)
        })
    }

    if (!props.conversation.groupConversation)
        return <article><Link href={`/profile/${props.participant.user.name}`}>{ props.participant.user.name }</Link></article>
    if (!showOptions)
    {
        if (!props.participant.restrictions.length)
            return <section onClick={(e) => {setShowOptions(true)}}><article>{ props.participant.user.name }</article><article>{ props.participant.role }</article></section>
        return (<section onClick={(e) => {setShowOptions(true)}}>
            <article>{ props.participant.user.name }</article>
            <article>{ props.participant.role }</article>
            <article>{ props.participant.restrictions.filter((e) => e.status === conversationRestrictionEnum.BAN).length ? "BANNED" : "MUTED" }</article>
            </ section>)
    }
    if (props.self?.role === ConversationRoleEnum.OWNER || (props.self?.role === ConversationRoleEnum.ADMIN && props.participant.role === ConversationRoleEnum.USER))
    {
        return (<section>
            <article>
            <Link href={`/profile/${props.participant.user.name}`}>
                { props.participant.user.name }
            </Link>
            </article>
            <article>{ props.participant.role }</article>
            { !props.participant.restrictions.filter((e) => e.status === conversationRestrictionEnum.MUTE).length ? <article onClick={() => {
                setError("")
                setSuccess("")
                if (!websockets.conversations?.connected)
                {
                    setError("Temporary network error, please try again later")
                    return
                }
                websockets.conversations.timeout(1000).emit("muteUser", { id: props.conversation.id, username: props.participant.user.name, date: new Date(new Date().getTime() + (24 * 60 * 60 * 1000))}, (err: any, answer: string ) => {
                if (err)
                {
                    setError("Failed to mute user")
                    return
                }
                setSuccess(answer)
            })
            }}>Mute for 24h</article> : <article onClick={ () =>
            {
                setError("")
                setSuccess("")
                if (!websockets.conversations?.connected)
                {
                    setError("Temporary network error, please try again later")
                    return
                }
                websockets.conversations.timeout(1000).emit("unmuteUser", { id: props.conversation.id, username: props.participant.user.name}, (err: any, answer: string ) => {
                if (err)
                {
                    setError("Failed to unmute user")
                    return
                }
                setSuccess(`Sucessfully unmuted ${props.participant.user.name}`)
                })
            }}>Unmute</article>} 
            { !props.participant.restrictions.filter((e) => e.status === conversationRestrictionEnum.BAN).length ?<><article onClick={ () =>
            {
                setError("")
                setSuccess("")
                if (!websockets.conversations?.connected)
                {
                    setError("Temporary network error, please try again later")
                    return
                }
                websockets.conversations.timeout(1000).emit("banUser", { id: props.conversation.id, username: props.participant.user.name, date: new Date(new Date().getTime() + (24 * 60 * 60 * 1000))}, (err: any, answer: string ) => {
                if (err)
                {
                    setError("Failed to ban user")
                    return
                }
                setSuccess(answer)
                })
            }} >Ban for 24h</article><article onClick={ () => {
                setError("")
                setSuccess("")
                if (!websockets.conversations?.connected)
                {
                    setError("Temporary network error, please try again later")
                    return
                }
                websockets.conversations.timeout(1000).emit("banUserIndefinitely", { id: props.conversation.id, username: props.participant.user.name}, (err: any, answer: string ) => {
                if (err)
                {
                    setError("Failed to ban user")
                    return
                }
                setSuccess(answer)
                })
            }}>Ban indefinitely</article></>:<article onClick={ () =>
                {
                    setError("")
                    setSuccess("")
                    if (!websockets.conversations?.connected)
                    {
                        setError("Temporary network error, please try again later")
                        return
                    }
                    websockets.conversations.timeout(1000).emit("unbanUser", { id: props.conversation.id, username: props.participant.user.name}, (err: any, answer: string ) => {
                    if (err)
                    {
                        setError("Failed to unban user")
                        return
                    }
                    setSuccess(`Sucessfully unbanned ${props.participant.user.name}`)
                    })
                }}>Unban</article>}
            <article>Change role: { props.self?.role === ConversationRoleEnum.OWNER ? (props.participant.role === ConversationRoleEnum.USER ? <><span onClick={() =>{ promoteUser(ConversationRoleEnum.OWNER, true) }}>OWNER</span><span onClick={() =>{ promoteUser(ConversationRoleEnum.ADMIN, true) }}>ADMIN</span></> : 
            <><span onClick={() =>{ promoteUser(ConversationRoleEnum.OWNER, true) }}>OWNER</span><span onClick={() =>{ promoteUser(ConversationRoleEnum.USER, false) }}>USER</span></>) :
            <span onClick={() =>{ promoteUser(ConversationRoleEnum.ADMIN, true) }}>ADMIN</span>}</article>
            <article onClick={ () => {setShowOptions(false)} }>
            < Image src={ ToggleCross } alt="toggle bar" />
            </article>
            { error.length ? <article>{error}</article> : <></> }
            { success.length ? <article>{success}</article> : <></> }
            </section>)
    }
    return (<section onClick={(e) => {setShowOptions(false)}}>
            <article>
            <Link href={`/profile/${props.participant.user.name}`}>
                { props.participant.user.name }
            </Link>
            </article>
            <article>{ props.participant.role }</article>
            <article>{ props.participant.restrictions.length ? (props.participant.restrictions.filter((e) => e.status === conversationRestrictionEnum.BAN).length ? "BANNED" : "MUTED") : <></> }</article>
            <article onClick={ () => {setShowOptions(false)} }>
            < Image src={ ToggleCross } alt="toggle bar" />
            </article>
            </section>)
}