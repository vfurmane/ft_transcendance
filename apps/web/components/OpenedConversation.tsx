import { Conversation as ConversationEntity } from "types"

interface OpenedConversationProps
{
    newConversation: boolean,
    conversation: ConversationEntity | {userId: string, userName: string}
}

export default function OpenedConversation( props : OpenedConversationProps ) : JSX.Element {
    return (
        <div><p>Opened conversation</p></div>
    )
}