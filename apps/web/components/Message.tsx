import { Message as MessageEntity } from "types";

interface MessageProps
{
    message: MessageEntity
}

export default function Message ( props : MessageProps ) : JSX.Element {

    console.error("Message loaded")
    if (props.message.sender)
    {
        return (
            <article><p>{ props.message.sender?.name }</p><br /><p>{ props.message.content }</p></article>
        )
    }
    else
    {
        return <article><p>{props.message.content}</p></article>
    }
}