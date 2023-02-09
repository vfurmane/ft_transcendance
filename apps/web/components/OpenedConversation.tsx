import { useContext, useEffect, useRef, useState } from "react"
import { Conversation as ConversationEntity, Message as MessageEntity } from "types"
import Message from "./Message"
import { useWebsocketContext } from "./Websocket"
import styles from "styles/openedConversation.module.scss";

interface OpenedConversationProps
{
    newConversation: {userId: string, userName: string} | null,
    conversation: ConversationEntity | null
}


export default function OpenedConversation( props : OpenedConversationProps ) : JSX.Element {
    const [messages, setMessages] = useState<MessageEntity[]>([])
    const [currentConversation, setCurrentConversation] = useState<ConversationEntity | null>(props.conversation)
    const [newConversation, setNewConversation] = useState<{userId: string, userName: string} | null>(props.newConversation)
    const websockets = useWebsocketContext()
    const lastElement = useRef<HTMLElement | undefined>(undefined)
    const formRef = useRef<HTMLFormElement | null>(null)
    const [ scroll, setScroll ] = useState<boolean>(true)

    const addNewMessage = (message : any) => {
        if (message.id === currentConversation?.id)
        {
            setMessages((m) => [...m, message.message])
            console.error(lastElement.current?.getBoundingClientRect().top)
            if (lastElement !== null && lastElement !== undefined)
            {
                const top = lastElement.current?.getBoundingClientRect().top;
                console.error(top, window.innerHeight)
                if (top && top >= 0 && top <= window.innerHeight)
                {
                    console.error("needToScroll")
                    setScroll(true)
                    return ;
                }
            }
        }
        setScroll(false)
    }

    const hydrateMessages = () =>
    {
        websockets.conversations?.emit("getMessages", {id : currentConversation?.id}, (messages : MessageEntity[]) =>
        {
            setMessages(() => messages)
        })
    }

    useEffect(() =>
    {
        websockets.conversations?.off("newMessage", addNewMessage)
        if (currentConversation)
        {
            console.error("Conversation already exists")
            if (websockets.conversations?.connected)
            {
                hydrateMessages()
                websockets.conversations.on("newMessage", addNewMessage)
                console.error(lastElement.current)
            }
        }
        else
        {
            setMessages(m => [])
        }
        return (() => {
            console.error("Cleaning up");
            websockets.conversations?.off("newMessage", addNewMessage) 
        })
    }, [])

    useEffect(() =>
    {
        if (scroll)
            lastElement.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])
    
    return (
        <section className={ styles.openedConversationContainer }>
        <section className={ styles.messages }>
            { messages.map((currentMessage) => <Message message={currentMessage} key={currentMessage.id}/>) }
            <article ref={lastElement}></article>
        </section>
        <section className={ styles.sendForm }>
            <form onSubmit={ (e) => {
            e.preventDefault()
            const message = (e.currentTarget.elements.namedItem("messageContent") as HTMLTextAreaElement).value
            console.error(message)
            if (!message || !message.length)
            {
                console.error("Nothing to see")
                return
            }
            if (!currentConversation)
            {
                console.error("Creating new conversation")
                let createdConversation !: ConversationEntity;
                websockets.conversations?.emit("createConversation", { groupConversation: false, participants: [newConversation?.userId]}, (conversation : any) => {
                    console.error(conversation)
                    createdConversation = conversation
                })
                // websockets.conversations?.emit('postMessage', { id : newConversation.id, content :  message })
                // props.conversation = newConversation
            }
            else
            {
                console.error("I already exist")
                websockets.conversations?.emit('postMessage', { id : currentConversation.id, content :  message }, (message : MessageEntity) => {
                    setMessages([...messages, message])
                    setScroll(true)
                })
            }
                (e.currentTarget.elements.namedItem("messageContent") as HTMLTextAreaElement).value = ""
            }
            } ref={formRef}>
            <textarea className={styles.sendMessageField} onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey)
                {
                    e.preventDefault()
                    formRef.current?.requestSubmit()
                }
            }} name="messageContent" id="messageContent" cols={42} rows={10}></textarea>
            <input type="submit" value="Send" />
            </form>
        </section>
        </section>
    )
}