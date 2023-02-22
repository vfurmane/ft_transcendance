import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import {
  Conversation as ConversationEntity,
  ConversationRole,
  ConversationRoleEnum,
} from "types";
import { selectUserState } from "../store/UserSlice";
import { useWebsocketContext } from "./Websocket";
import { Userfront as User } from "types";

interface manageConversationProps {
  currentConversation: ConversationEntity;
  selectConversation: Dispatch<SetStateAction<ConversationEntity | null>>;
  self: MutableRefObject<ConversationRole | null>;
  participants: ConversationRole[];
}

export default function ManageConversation(
  props: manageConversationProps
): JSX.Element {
  const websockets = useWebsocketContext();
  const formRef = useRef<HTMLFormElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string>("");
  const [matches, setMatches] = useState<User[]>([]);
  const [participants, setParticipants] = useState<User[]>([]);
  const [displaySearchBox, setDisplaySearchBox] = useState<boolean>(false);

  return (
    <>
      {props.self.current &&
      props.self.current.role === ConversationRoleEnum.OWNER &&
      props.participants.length > 1 ? (
        <article>Leave (pick a new owner if you want to leave)</article>
      ) : (
        <article
          onClick={() => {
            if (websockets.conversations?.connected) {
              websockets.conversations.emit(
                "leaveConversation",
                { id: props.currentConversation.id },
                () => {
                  props.selectConversation(null);
                }
              );
            }
          }}
        >
          Leave
        </article>
      )}
      <article
        onClick={() => {
          setDisplaySearchBox(true);
        }}
      >
        Invite someone
      </article>
      {displaySearchBox ? (
        <>
          <section className="errors">
            {errors.map((error) => (
              <div>{error}</div>
            ))}
          </section>
          <section className="success">
            {success.length ? <div>{success}</div> : <></>}
          </section>
          <input
            ref={searchRef}
            name="participants"
            placeholder="Search a user"
            type="text"
            onChange={(e) => {
              setErrors([]);
              if (!e.target.value.length) {
                setMatches([...[]]);
                return;
              }
              fetch(`/api/search?letters=${e.target.value}`, {
                credentials: "same-origin",
              })
                .then((response) => {
                  if (!response.ok) {
                    setErrors((prev) => [...prev, "Unauthorized request"]);
                    return;
                  }
                  response.json().then((data: User[]) => {
                    const currentMatches = data.filter((res: User) => {
                      if (
                        participants.filter(
                          (participant) =>
                            participant.name.toLowerCase() ===
                            res.name.toLowerCase()
                        ).length
                      )
                        return false;
                      return true;
                    });
                    setMatches([...currentMatches]);
                  });
                })
                .catch(function (error) {
                  setErrors((prev) => [
                    ...prev,
                    "Il y a eu un problème avec l'opération fetch : " +
                      error.message,
                  ]);
                });
            }}
          />
          <section>
            {matches.map((el) => (
              <article
                key={el.id}
                onClick={(e) => {
                  setErrors([]);
                  setSuccess("");
                  if (!websockets.conversations?.connected) {
                    setErrors(["Cannot reach server, try again later"]);
                    return;
                  }
                  websockets.conversations.emit(
                    "inviteToConversation",
                    {
                      target: el.id,
                      conversationID: props.currentConversation.id,
                    },
                    (res: boolean) => {
                      if (res === true) {
                        setSuccess("Invitation sucessfully sent");
                        setTimeout(() => {
                          setDisplaySearchBox(false);
                          setSuccess(""), setErrors([]);
                        }, 2000);
                      } else {
                        setErrors([
                          "Cannot invite this person in this conversation",
                        ]);
                      }
                    }
                  );
                }}
              >
                {el.name}
              </article>
            ))}
          </section>{" "}
        </>
      ) : (
        <></>
      )}
    </>
  );
}
