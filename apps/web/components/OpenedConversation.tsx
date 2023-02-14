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
    const lastElement = useRef<HTMLElement | null>(null)
    const formRef = useRef<HTMLFormElement | null>(null)
    const [ scroll, setScroll ] = useState<boolean>(true)
    const socketConnected = useRef<boolean>(false);

    const addNewMessage = (message : any) => {
        if (message.id === currentConversation?.id)
        {
            setMessages((m) => [...m, message.message])
            console.error(lastElement.current?.getBoundingClientRect().top)
            if (lastElement !== null)
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
        console.log("hydrating")
        websockets.conversations?.emit("getMessages", {id : currentConversation?.id}, (messages : MessageEntity[]) =>
        {
            setMessages(() => messages)
        })
    }

    useEffect(() =>
    {
        if (currentConversation)
        {
            if (websockets.conversations?.connected && socketConnected.current === false)
            {
                hydrateMessages()
                websockets.conversations.on("newMessage", addNewMessage)
                socketConnected.current = true
            }
            else if (websockets.conversations?.disconnected)
            {
                console.error("Socket connection error")
                socketConnected.current = false
            }
        }
        else
        {
            setMessages(m => [])
        }
        return (() => {
            websockets.conversations?.off("newMessage", addNewMessage) 
        })
    }, [currentConversation, websockets.conversations?.connected])

    useEffect(() =>
    {
        if (scroll)
            lastElement.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, scroll])
    
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
                    websockets.conversations?.emit('postMessage', { id : conversation.id, content :  message })
                })
                setCurrentConversation(createdConversation)
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