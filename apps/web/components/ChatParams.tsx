import Link from "next/link";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Conversation as ConversationEntity,
  conversationRestrictionEnum,
  ConversationRole,
} from "types";
import { selectUserState } from "../store/UserSlice";
import ConversationParticipant from "./ConversationParticipant";
import ManageConversation from "./manageConversation";
import { useWebsocketContext } from "./Websocket";

interface chatParamsProps {
  currentConversation: ConversationEntity;
  selectConversation: Dispatch<SetStateAction<ConversationEntity | null>>;
}
export default function ChatParams(props: chatParamsProps): JSX.Element {
  const websockets = useWebsocketContext();
  const [participants, setParticipants] = useState<ConversationRole[]>([]);
  const self = useRef<ConversationRole | null>(null);
  const userState = useSelector(selectUserState);

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
        }
      );
    }
  }, [participants]);
  if (!self) return <></>;
  else {
    return (
      <>
        {props.currentConversation.groupConversation ? (
          <ManageConversation
            selectConversation={props.selectConversation}
            currentConversation={props.currentConversation}
            self={self}
            participants={participants}
          />
        ) : (
          <></>
        )}
        <section style={{overflowY:'scroll', overflowX:'hidden', height:'80%'}}>
          {props.currentConversation.groupConversation ? (
            <div>
              <p style={{marginTop:'20px'}}>____________________________________</p>
              <h4 >Participants :</h4>
              
            </div>
           
          ) : (
            <></>
          )}
          {participants.map((participant) => {
            if (participant.user.id === userState.id) return <></>;
            return (
              <div style={{marginBottom: '10px'}}>
                <ConversationParticipant
                key={participant.user.id}
                participant={participant}
                self={self.current}
                conversation={props.currentConversation}
              />
              </div>
              
            );
          })}
        </section>
      </>
    );
  }
}
