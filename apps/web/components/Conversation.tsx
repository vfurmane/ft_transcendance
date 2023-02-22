import { useSelector } from "react-redux";
import { selectUserState } from "../store/UserSlice";
import styles from "styles/Conversation.module.scss";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Conversation as ConversationEntity,
  conversationRestrictionEnum,
  ConversationsDetails,
  ConversationWithUnread,
  DMExists,
  Message,
  unreadMessagesResponse,
} from "types";
import { useWebsocketContext } from "./Websocket";
import { selectBlockedUsersState } from "../store/BlockedUsersSlice";

export default function Conversation(props: {
  conversation: ConversationWithUnread;
  selectConversation: Dispatch<SetStateAction<ConversationEntity | null>>;
  setConversationList: Dispatch<SetStateAction<ConversationWithUnread[]>>;
}) {
  const userState = useSelector(selectUserState);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBanned, setIsBanned] = useState<boolean>(
    props.conversation.conversation.conversationRoles[0].restrictions.find(
      (restriction) => restriction.status === conversationRestrictionEnum.BAN
    ) !== undefined
  );
  const websockets = useWebsocketContext();
  const BlockedUsersState = useSelector(selectBlockedUsersState);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  const newBanned = (banned: {
    conversationID: string;
    userId: string | undefined;
  }) => {
    if (
      banned.conversationID === props.conversation.conversation.id &&
      banned.userId !== undefined &&
      banned.userId === userState.id
    ) {
      setIsBanned(true);
    }
  };

  const refresh = () => {
    websockets.conversations?.emit(
      "getConversations",
      (conversationDetails: ConversationsDetails) => {
        props.setConversationList(conversationDetails.conversations);
      }
    );
  };

  const newUnbanned = (unbanned: {
    conversationID: string;
    userId: string | undefined;
  }) => {
    if (
      unbanned.conversationID === props.conversation.conversation.id &&
      unbanned.userId !== undefined &&
      unbanned.userId === userState.id
    ) {
      setIsBanned(false);
      setTimeout(refresh, 500);
    }
  };

  useEffect(() => {
    if (props.conversation.conversation.groupConversation === false) {
      const id = props.conversation.conversation.conversationRoles.find(
        (role) => role.user.id !== userState.id
      )?.user.id;
      if (
        id !== undefined &&
        BlockedUsersState.includes(id) &&
        isBlocked === false
      ) {
        setIsBlocked(true);
      } else {
        setIsBlocked(false);
      }
    }
  }, [BlockedUsersState]);

  useEffect(() => {
    if (websockets.conversations?.connected && loading) {
      websockets.conversations.on("bannedUser", newBanned);
      websockets.conversations.on("unbannedUser", newUnbanned);
      setLoading(false);
    }
  }, [loading, isBanned]);

  if (loading || isBlocked) return <></>;
  if (props.conversation.conversation.groupConversation === true) {
    if (isBanned) {
      return (
        <article className={styles.containerConversationBanned}>
          <h4>{props.conversation.conversation.name} </h4>
          <aside>
            <div className={styles.banned}>BANNED</div>
          </aside>
        </article>
      );
    }
    return (
      <article
        className={styles.containerConversation}
        onClick={() => {
          props.selectConversation(props.conversation.conversation);
        }}
      >
        <h4>{props.conversation.conversation.name} </h4>
        <aside>
          <div className={styles.nbUnread}>
            {props.conversation.numberOfUnreadMessages
              ? props.conversation.numberOfUnreadMessages
              : ""}
          </div>
        </aside>
      </article>
    );
  } else {
    return (
      <article
        className={styles.containerConversation}
        onClick={() => {
          props.selectConversation(props.conversation.conversation);
        }}
      >
        <h4>
          {
            props.conversation.conversation.conversationRoles.find(
              (role) => role.user.id !== userState.id
            )?.user.name
          }
        </h4>
        <aside>
          <div className={styles.nbUnread}>
            {props.conversation.numberOfUnreadMessages
              ? props.conversation.numberOfUnreadMessages
              : ""}
          </div>
        </aside>
      </article>
    );
  }
}
