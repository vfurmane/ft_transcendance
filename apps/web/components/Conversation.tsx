import { ConversationWithUnread } from "types"


export default function Conversation( props : { conversation : ConversationWithUnread })
{
    return (
        <article>
            <h4>{props.conversation.conversation.name}</h4>
            <aside>{props.conversation.numberOfUnreadMessages ? props.conversation.numberOfUnreadMessages : ''}</aside>
        </article>
    )
}