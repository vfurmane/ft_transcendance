import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Conversation as ConversationEntity,
  conversationRestrictionEnum,
  ConversationsDetails,
  ConversationWithUnread,
  Message as MessageEntity,
  unreadMessagesResponse,
} from "types";
import Message from "./Message";
import ConversationControls from "./ConversationControls";
import { useWebsocketContext } from "./Websocket";
import styles from "styles/openedConversation.module.scss";
import ChatParams from "./ChatParams";
import { useDispatch, useSelector } from "react-redux";
import { OpenConversation } from "../store/ConversationSlice";
import { selectUserState } from "../store/UserSlice";

interface OpenedConversationProps {
  newConversation: { userId: string; userName: string } | null;
  conversation: ConversationEntity | null;
  name: string | undefined;
  selectConversation: Dispatch<SetStateAction<ConversationEntity | null>>;
  updateUnreadMessage: Dispatch<SetStateAction<number>>;
  updateConversationList: Dispatch<SetStateAction<ConversationWithUnread[]>>;
}

export default function OpenedConversation(
  props: OpenedConversationProps
): JSX.Element {
  const userState = useSelector(selectUserState);
  const [messages, setMessages] = useState<MessageEntity[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<ConversationEntity | null>(props.conversation);
  const [newConversation, setNewConversation] = useState<{
    userId: string;
    userName: string;
  } | null>(props.newConversation);
  const websockets = useWebsocketContext();
  const lastElement = useRef<HTMLElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [scroll, setScroll] = useState<boolean>(true);
  const socketConnected = useRef<boolean>(false);
  const [menuVisibility, setMenuVisibility] = useState<boolean>(false);
  const dispatch = useDispatch();

  const updateConvList = () =>
  {
    websockets.conversations?.emit(
      "getConversations",
      (conversationDetails: ConversationsDetails) => {
        props.updateConversationList(
          conversationDetails.conversations
        );
      }
    )
  }

  const amIBanned = (banned: {
    conversationID: string;
    userId: string | undefined;
  }) => {
    if (
      banned.conversationID === props.conversation?.id &&
      banned.userId !== undefined &&
      banned.userId === userState.id
    ) {
      props.selectConversation(null);
      setTimeout(updateConvList, 50)
    }
  };

  const amIKicked = (kicked: {
    conversationID: string;
    userId: string | undefined;
  }) => {
    if (
      kicked.conversationID === props.conversation?.id &&
      kicked.userId !== undefined &&
      kicked.userId === userState.id
    ) {
      props.selectConversation(null);
      setTimeout(updateConvList, 50)
    }
  };

  const addNewMessage = (message: any) => {
    if (message.id === currentConversation?.id) {
      setMessages((m) => [...m, message.message]);
      console.error(lastElement.current?.getBoundingClientRect().top);
      if (lastElement !== null) {
        const top = lastElement.current?.getBoundingClientRect().top;
        console.error(top, window.innerHeight);
        if (top && top >= 0 && top <= window.innerHeight) {
          console.error("needToScroll");
          setScroll(true);
          return;
        }
      }
    }
    setScroll(false);
  };

  const hydrateMessages = () => {
    websockets.conversations?.emit(
      "getMessages",
      { id: currentConversation?.id },
      (messages: MessageEntity[]) => {
        setMessages(() => messages);
      }
    );
  };

  useEffect(() => {
    if (currentConversation) {
      if (
        websockets.conversations?.connected &&
        socketConnected.current === false
      ) {
        hydrateMessages();
        websockets.conversations.on("newMessage", addNewMessage);
        websockets.conversations.on("bannedUser", amIBanned);
        websockets.conversations.on("kickedUser", amIKicked);
        socketConnected.current = true;
      } else if (websockets.conversations?.disconnected) {
        socketConnected.current = false;
      }
    } else {
      setMessages((m) => []);
    }
    return () => {
      websockets.conversations?.off("newMessage", addNewMessage);
      if (currentConversation) {
        const targetId = currentConversation.id;
        websockets.conversations
          ?.timeout(2000)
          .emit("read", { id: targetId }, (err: any, mess: boolean) => {
            if (err) {
              return;
            }
            setTimeout(() => {
              websockets.conversations?.emit(
                "getUnread",
                ({ totalNumberOfUnreadMessages }: unreadMessagesResponse) => {
                  props.updateUnreadMessage(totalNumberOfUnreadMessages);
                  updateConvList()
                }
              );
            }, 50);
            return;
          });
      }
    };
  }, [currentConversation, websockets.conversations?.connected]);

  useEffect(() => {
    if (scroll) lastElement.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, scroll]);

  return (
    <section className={styles.openedConversationContainer}>
      <ConversationControls
        conversation={currentConversation}
        newConversation={newConversation}
        visibility={menuVisibility}
        setVisibility={setMenuVisibility}
        name={props.name}
      />
      <section className={styles.messages}>
        {messages.map((currentMessage) => (
          <Message
            message={currentMessage}
            key={currentMessage.id}
            group={currentConversation?.groupConversation ? true : false}
          />
        ))}
        <article ref={lastElement}></article>
      </section>
      <section className={styles.sendForm}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const message = (
              e.currentTarget.elements.namedItem(
                "messageContent"
              ) as HTMLTextAreaElement
            ).value;
            console.error(message);
            if (!message || !message.length) return;
            if (!currentConversation) {
              console.error("Creating new conversation");
              let createdConversation!: ConversationEntity;
              websockets.conversations?.emit(
                "createConversation",
                {
                  groupConversation: false,
                  participant: newConversation?.userId,
                },
                (conversation: any) => {
                  createdConversation = conversation;
                  setCurrentConversation(createdConversation);
                  websockets.conversations?.emit(
                    "postMessage",
                    { id: conversation.id, content: message },
                    (message: MessageEntity) => {
                      setMessages((prev) => [...prev, message]);
                      setNewConversation(null);
                    }
                  );
                }
              );
            } else {
              websockets.conversations?.emit(
                "postMessage",
                { id: currentConversation.id, content: message },
                (message: MessageEntity) => {
                  setMessages([...messages, message]);
                  setScroll(true);
                }
              );
            }
            (
              e.currentTarget.elements.namedItem(
                "messageContent"
              ) as HTMLTextAreaElement
            ).value = "";
          }}
          ref={formRef}
        >
          <textarea
            className={styles.sendMessageField}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
            name="messageContent"
            id="messageContent"
            cols={42}
            rows={10}
          ></textarea>
          <input type="submit" value="Send" />
        </form>
      </section>
      {menuVisibility && currentConversation ? (
        <section className={styles.chatParams}>
          <ChatParams
            currentConversation={currentConversation}
            selectConversation={props.selectConversation}
          />
        </section>
      ) : (
        <></>
      )}
    </section>
  );
}
