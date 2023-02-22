import { useEffect, useState } from "react";
import {
  Conversation as ConversationEntity,
  ConversationsDetails,
  ConversationWithUnread,
  DMExists,
  Message,
  unreadMessagesResponse,
} from "types";
import Conversation from "./Conversation";
import OpenedConversation from "./OpenedConversation";
import { useWebsocketContext } from "./Websocket";
import styles from "styles/chat.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  ReinitConversations,
  selectConversationsState,
} from "../store/ConversationSlice";
import Image from "next/image";
import back from "../public/back.png";
import addCross from "../public/addCross.png";
import CreateConversation from "./CreateConversation";

interface ChatProps {
  conversation: { userId: string; userName: string };
  updateUnreadMessage: React.Dispatch<React.SetStateAction<number>>;
}

export default function Chat({
  conversation,
  updateUnreadMessage,
}: ChatProps): JSX.Element {
  const [conversationSelected, selectConversation] =
    useState<ConversationEntity | null>(null);
  const [conversationList, setConversationList] = useState<
    ConversationWithUnread[]
  >([]);
  const [newConversation, setNewConversation] = useState<{
    userId: string;
    userName: string;
  }>(conversation);
  const [loading, setLoading] = useState(true);
  const [createConversation, setCreateConversation] = useState<boolean>(false);
  const websockets = useWebsocketContext();
  const conversationToOpen = useSelector(selectConversationsState);
  const dispatch = useDispatch();

  const refreshConversations = () => {
    websockets.conversations?.emit(
      "getConversations",
      (conversationDetails: ConversationsDetails) => {
        setConversationList(() => conversationDetails.conversations);
      }
    );
  };

  const addNewConversation = (conversation: ConversationEntity) => {
    refreshConversations();
  };

  const newUnread = (message: { id: string; message: Message }) => {
    refreshConversations();
  };

  useEffect(() => {
    if (conversationToOpen.userId.length) {
      setNewConversation(conversationToOpen);
      setCreateConversation(false);
      dispatch(ReinitConversations());
    }
  }, [conversationToOpen]);

  useEffect(() => {
    setLoading(true);
    console.error("Conversation selected: ", conversationSelected);
    if (newConversation.userId.length) {
      websockets.conversations?.emit(
        "DMExists",
        { id: newConversation.userId },
        (DM: DMExists) => {
          if (DM.conversationExists) {
            selectConversation(DM.conversation);
            setNewConversation(() => {
              return { userId: "", userName: "" };
            });
            setLoading(false);
          } else {
            selectConversation(null);
            setLoading(false);
          }
        }
      );
    } else if (!conversationSelected && !newConversation.userId.length) {
      if (websockets.conversations?.connected && websockets.pong?.connected) {
        websockets.conversations.emit(
          "getConversations",
          (conversationDetails: ConversationsDetails) => {
            setConversationList(() => conversationDetails.conversations);
            setLoading(false);
          }
        );
        websockets.conversations.on("newConversation", addNewConversation);
        websockets.pong.on("newConversation", addNewConversation);
        websockets.conversations.on("newMessage", newUnread);
        websockets.pong.on("newMessage", newUnread);
      }
    } else {
      setLoading(false);
    }
    return () => {
      websockets.conversations?.off("newConversation", addNewConversation);
      websockets.pong?.off("newConversation");
      websockets.conversations?.off("newMessage", newUnread);
      websockets.pong?.off("newMessage");
      websockets.conversations?.emit(
        "getUnread",
        ({ totalNumberOfUnreadMessages }: unreadMessagesResponse) => {
          updateUnreadMessage(totalNumberOfUnreadMessages);
        }
      );
    };
  }, [conversationSelected, newConversation, createConversation]);

  if (loading) return <></>;
  if (createConversation === true) {
    return (
      <>
        <article
          className={styles.backButton}
          onClick={(e) => {
            setCreateConversation(false);
          }}
        >
          <Image alt="back" src={back} />
        </article>
        <section className={styles.conversationsContainer}>
          <CreateConversation
            changeConversation={selectConversation}
            closeCreator={setCreateConversation}
          />
        </section>
      </>
    );
  } else if (newConversation.userId.length || conversationSelected !== null) {
    return (
      <>
        <article
          className={styles.backButton}
          onClick={(e) => {
            selectConversation(null);
            setNewConversation({ userId: "", userName: "" });
          }}
        >
          <Image alt="back" src={back} />
        </article>
        <section className={styles.conversationsContainer}>
          <OpenedConversation
            newConversation={
              newConversation.userId.length ? newConversation : null
            }
            conversation={
              newConversation.userId.length ? null : conversationSelected
            }
            selectConversation={selectConversation}
            updateUnreadMessage={updateUnreadMessage}
            updateConversationList={setConversationList}
          />
        </section>
      </>
    );
  }
  return (
    <>
      <article
        className={styles.createButton}
        title="Create a group conversation"
        onClick={(e) => {
          setCreateConversation(true);
        }}
      >
        <Image alt="create Conversation" src={addCross} />
      </article>
      <section className={styles.conversationsContainer}>
        {conversationList.length ? (
          conversationList.map((conversation) => (
            <article
              key={`${conversation.conversation.id}_container`}
              onClick={() => {
                selectConversation(conversation.conversation);
              }}
            >
              <Conversation
                key={conversation.conversation.id}
                conversation={conversation}
              />
            </article>
          ))
        ) : (
          <article>No conversations yet</article>
        )}
      </section>
    </>
  );
}
