import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "styles/chatBar.module.scss";
import textStyles from "styles/text.module.scss";
import { unreadMessagesResponse } from "types";
import { ReinitConversations, selectConversationsState } from "../store/ConversationSlice";
import Chat from "./Chat";
import { useWebsocketContext } from "./Websocket";

export default function ChatBar(): JSX.Element {
  const [visibility, setVisibility] = useState<boolean>(false)
  const [unreadMessages, setUnreadMessages] = useState<number>(0)
  const websockets = useWebsocketContext();
  const conversationToOpen = useSelector(selectConversationsState)
  const dispatch = useDispatch()
  let [conversationIdProp, setConversationIdProp] = useState<{userId: string, userName: string}>({userId: "", userName: ""})

  useEffect(() =>
  {
    if (conversationToOpen.userId.length)
    {
      setVisibility(true)
      setConversationIdProp(conversationToOpen)
      dispatch(ReinitConversations())
    }
    if (visibility === false)
    {
      if (websockets.conversations?.connected)
      {
        websockets.conversations.emit("getUnread", ( { totalNumberOfUnreadMessages } : unreadMessagesResponse ) =>
        {
          setUnreadMessages(totalNumberOfUnreadMessages)
        })
        websockets.conversations.on("newMessage", () => setUnreadMessages(unreadMessages + 1))
      }
    }
    else
    {
      websockets.conversations?.off("newMessage")
      setUnreadMessages(0)
    }
    return (() =>
    {
      websockets.conversations?.off("newMessage")
    })
  },[conversationToOpen, visibility])

  if (!visibility)
  {
    return (
      <div className={styles.containerChatBar} onClick={ (e) => {
        setVisibility(true); setConversationIdProp({userId: "", userName: ""}); } 
      }>
        <h3 className={textStyles.laquer}>Chat</h3>
        <aside className={`${textStyles.laquer} ${styles.unreadMessages}`}>{unreadMessages ? unreadMessages : ''}</aside>
      </div>
    );
  }
  else
  {
    return (
      <div className={styles.containerChat} >
        <aside className={textStyles.laquer} onClick={ (e) => {
          setVisibility(false); setConversationIdProp({userId: "", userName: ""}); } 
        }>X</aside>
        <section className={styles.conversationListContainer}>
          <Chat conversation={conversationIdProp} />
        </section>
      </div>
    )
  }
}
