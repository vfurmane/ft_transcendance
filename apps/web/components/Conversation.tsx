import { useSelector } from "react-redux";
import { selectUserState } from "../store/UserSlice";
import styles from "styles/Conversation.module.scss";
import { Dispatch, SetStateAction } from "react";
import {
  Conversation as ConversationEntity,
  ConversationsDetails,
  ConversationWithUnread,
  DMExists,
  Message,
  unreadMessagesResponse,
} from "types";

export default function Conversation(props: {
  conversation: ConversationWithUnread;
  selectConversation: Dispatch<SetStateAction<ConversationEntity | null>>
}) {
  const userState = useSelector(selectUserState);
  console.error(props.conversation.conversation.conversationRoles.find((role) => role.user.id !== userState.id)?.user.name)
  if (props.conversation.conversation.groupConversation === true) {
    return (
      <article className={styles.containerConversation} onClick={() => {
        props.selectConversation(props.conversation.conversation);
      }}>
        <h4 >{props.conversation.conversation.name} </h4>
        <aside>
          {props.conversation.numberOfUnreadMessages
            ? props.conversation.numberOfUnreadMessages
            : ""}
        </aside>
      </article>
    );
  } else {
    return (
      <article className={styles.containerConversation} onClick={() => {
        props.selectConversation(props.conversation.conversation);
      }}>
        <h4 >
          {props.conversation.conversation.conversationRoles.find((role) => role.user.id !== userState.id)?.user.name}
        </h4>
        <aside>
          {props.conversation.numberOfUnreadMessages
            ? props.conversation.numberOfUnreadMessages
            : ""}
        </aside>
      </article>
    );
  }
}
