import { useSelector } from "react-redux";
import { ConversationWithUnread } from "types"
import { selectUserState } from "../store/UserSlice";


export default function Conversation( props : { conversation : ConversationWithUnread })
{
    const userState = useSelector(selectUserState);

    if (props.conversation.conversation.groupConversation === true)
    {
        return (
            <article>
                <h4>{props.conversation.conversation.name}</h4>
                <aside>{props.conversation.numberOfUnreadMessages ? props.conversation.numberOfUnreadMessages : ''}</aside>
            </article>
        )
    }
    else
    {
        return (
            <article>
                <h4>{props.conversation.conversation.name.replace(userState.name, '').replace(' - ', '')}</h4>
                <aside>{props.conversation.numberOfUnreadMessages ? props.conversation.numberOfUnreadMessages : ''}</aside>
            </article>
        )
    }
}