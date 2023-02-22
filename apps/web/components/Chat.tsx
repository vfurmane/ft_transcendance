import { useEffect, useState } from "react";
import {
  Conversation as ConversationEntity,
  conversationRestrictionEnum,
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
import SearchChannel from "./SearchChannel";
import Search from "../public/Search.png";
import { selectUserState } from "../store/UserSlice";

interface ChatProps {
  conversation: { userId: string; userName: string };
  updateUnreadMessage: React.Dispatch<React.SetStateAction<number>>;
}

export default function Chat({
  conversation,
  updateUnreadMessage,
}: ChatProps): JSX.Element {
  const userState = useSelector(selectUserState);
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
  const [searchChannel, setSearchChannel] = useState<boolean>(false);
  const websockets = useWebsocketContext();
  const conversationToOpen = useSelector(selectConversationsState);
  const dispatch = useDispatch();

  const refreshConversations = () => {
    websockets.conversations?.emit(
      "getConversations",
      (conversationDetails: ConversationsDetails) => {
        setConversationList(conversationDetails.conversations);
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

  const kickMeImFamous = (kicked: {
    conversationID: string;
    userId: string | undefined;
  }) => {
    if (
      kicked.userId !== undefined &&
      kicked.userId === userState.id
    ) {
      selectConversation(null);
      setTimeout(refreshConversations, 25)
    }
  };

  useEffect(() => {
    setLoading(true);
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
        websockets.conversations.on("kickedUser", kickMeImFamous);
        websockets.pong.on("newMessage", newUnread);
      }
    } else {
      setLoading(false);
    }
    return () => {
      websockets.conversations?.off("newConversation", addNewConversation);
      websockets.pong?.off("newConversation");
      websockets.conversations?.off("newMessage", newUnread);
      websockets.conversations?.off("bannedUser");
      websockets.conversations?.off("unbannedUser");
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
            setSearchChannel(false);
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
  } else if (searchChannel === true) {
    return (
      <>
        <article
          className={styles.backButton}
          onClick={(e) => {
            setCreateConversation(false);
            setSearchChannel(false);
          }}
        >
          <Image alt="back" src={back} />
        </article>
        <section className={styles.conversationsContainer}>
          <SearchChannel
            changeConversation={selectConversation}
            closeSearchChannel={setSearchChannel}
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
            name={
              conversationSelected
                ? conversationSelected.groupConversation
                  ? conversationSelected.name
                  : conversationSelected.conversationRoles?.find(
                      (role) => role.user.id !== userState.id
                    )?.user.name
                : newConversation.userName
            }
            muted={ !conversationSelected ? false : (conversationSelected.groupConversation === false ? false:((conversationSelected.conversationRoles === undefined || !conversationSelected.conversationRoles.length) ? false : conversationSelected.conversationRoles[0].restrictions.find((restriction) => restriction.status === conversationRestrictionEnum.MUTE) !== undefined))}
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
      <article
        title="Search a channel"
        onClick={(e) => {
          setSearchChannel(true);
        }}
        className={styles.searchBar}
      >
        JOIN
        <Image alt="search" src={Search} className={styles.logoSearchBar} />
      </article>
      <section className={styles.conversationsContainer}>
        {conversationList.length ? (
          conversationList.map((conversation) => (
            <Conversation
              key={conversation.conversation.id}
              conversation={conversation}
              selectConversation={selectConversation}
              setConversationList={setConversationList}
            />
          ))
        ) : (
          <article>No conversations yet</article>
        )}
      </section>
    </>
  );
}
