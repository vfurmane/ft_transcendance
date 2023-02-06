import { ConversationWithUnread } from "types"


export default function Conversation( props : ConversationWithUnread)
{
    return (
        <article>
            <h4>{props.conversation.name}</h4>
            <aside>{props.numberOfUnreadMessages ? props.numberOfUnreadMessages : ''}</aside>
        </article>
    )
}