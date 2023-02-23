import Link from "next/link";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Conversation as ConversationEntity,
  conversationRestrictionEnum,
  ConversationRole,
  ConversationWithUnread,
} from "types";
import { selectUserState } from "../store/UserSlice";
import ConversationParticipant from "./ConversationParticipant";
import ManageConversation from "./manageConversation";
import { useWebsocketContext } from "./Websocket";

interface chatParamsProps {
  currentConversation: ConversationEntity;
  updateConversationList: Dispatch<SetStateAction<ConversationWithUnread[]>>;
  selectConversation: Dispatch<SetStateAction<ConversationEntity | null>>;
  visibility: {
    conversationVisibility: boolean;
    setConversationVisibility: Dispatch<SetStateAction<boolean>>;
}
password: {
  conversationPassword: boolean;
  setConversationPassword: Dispatch<SetStateAction<boolean>>;
}
}
export default function ChatParams(props: chatParamsProps): JSX.Element {
  const websockets = useWebsocketContext();
  const [participants, setParticipants] = useState<ConversationRole[]>([]);
  const self = useRef<ConversationRole | null>(null);
  const userState = useSelector(selectUserState);

  const refreshParticipants = () =>
  {
    websockets.conversations?.emit(
      "getParticipants",
      { id: props.currentConversation.id },
      (roles: ConversationRole[]) => {
        setParticipants(roles)
        self.current = roles.filter((e) => e.user.id === userState.id)[0];
        })
  }

  const findKicked = (payload : {conversationID: string, userId: string | undefined}) =>
  {
    if (props.currentConversation.id === payload.conversationID)
      refreshParticipants()
  }

  const findMuted = (payload : {conversationID: string, userId: string | undefined}) =>
  {
    if (props.currentConversation.id === payload.conversationID)
      refreshParticipants()
  }

  const findBanned = (payload : {conversationID: string, userId: string | undefined}) =>
  {
    if (props.currentConversation.id === payload.conversationID)
      refreshParticipants()
  }

  useEffect(() => {
    if (websockets.conversations?.connected && participants.length === 0) {
      websockets.conversations.emit(
        "getParticipants",
        { id: props.currentConversation.id },
        (roles: ConversationRole[]) => {
          setParticipants((prev) => {
            const tmp = [...prev, ...roles];
            self.current = tmp.filter((e) => e.user.id === userState.id)[0];
            return tmp;
          });
          websockets.conversations?.on("kickedUser", findKicked)
          websockets.conversations?.on("bannedUser", findBanned)
          websockets.conversations?.on("mutedUser", findMuted)
        }
      );
    }
  }, [participants]);
  if (!self) return <></>;
  else {
    return (
      <section style={{height: "88%", display: "flex", flexDirection:"column"}}>
        {props.currentConversation.groupConversation ? (
          <ManageConversation
            selectConversation={props.selectConversation}
            currentConversation={props.currentConversation}
            self={self}
            participants={participants}
            updateConversationList={props.updateConversationList}
            visibility={props.visibility}
            password={props.password}
          />
        ) : (
          <></>
        )}
        <section
          style={{ overflowY: "scroll", overflowX: "hidden", height: "100%" }}
        >
          {props.currentConversation.groupConversation ? (
            <div>
              <p style={{ marginTop: "20px" }}>
                ____________________________________
              </p>
              <h4>Participants :</h4>
            </div>
          ) : (
            <></>
          )}
          {participants.map((participant) => {
            if (participant.user.id === userState.id) return null;
            return (
              <div key={participant.user.id} style={{ marginBottom: "10px" }}>
                <ConversationParticipant
                  participant={participant}
                  self={self.current}
                  conversation={props.currentConversation}
                  setParticipants={setParticipants}
                />
              </div>
            );
          })}
        </section>
      </section>
    );
  }
}
