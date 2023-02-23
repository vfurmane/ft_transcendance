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
  ConversationsDetails,
  ConversationWithUnread,
} from "types";
import { selectUserState } from "../store/UserSlice";
import { useWebsocketContext } from "./Websocket";
import { Userfront as User } from "types";

interface manageConversationProps {
  currentConversation: ConversationEntity;
  selectConversation: Dispatch<SetStateAction<ConversationEntity | null>>;
  self: MutableRefObject<ConversationRole | null>;
  participants: ConversationRole[];
  updateConversationList: Dispatch<SetStateAction<ConversationWithUnread[]>>;
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
  const [displaySearchBox, setDisplaySearchBox] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(
    props.currentConversation.visible
  );
  const [hasPassword, setHasPassword] = useState<boolean>(
    props.currentConversation.has_password
  );
  const [updatePassword, setUpdatePassword] = useState<boolean>(false);
  const [addPassword, setAddPassword] = useState<boolean>(false);
  const [removePassword, setRemovePassword] = useState<boolean>(false);

  const updateConvList = () => {
    websockets.conversations
      ?.timeout(1000)
      .emit(
        "getConversations",
        (err: any, conversationDetails: ConversationsDetails) => {
          if (err) return;
          props.updateConversationList(conversationDetails.conversations);
        }
      );
  };

  const makeInvisible = () => {
    console.error("Making Invisible");
    websockets.conversations
      ?.timeout(1000)
      .emit(
        "makeInvisible",
        { id: props.currentConversation.id },
        (err: any, ret: boolean) => {
          console.error("Callback, entering with: ", err, ret);
          if (err) {
            setErrors(["Network issue, please try again later"]);
            return;
          }
          setIsVisible(false);
        }
      );
  };

  const makeVisible = () => {
    console.error("Making visible");
    websockets.conversations
      ?.timeout(1000)
      .emit(
        "makeVisible",
        { id: props.currentConversation.id },
        (err: any, ret: boolean) => {
          console.error("Callback, entering with: ", err, ret);
          if (err) {
            setErrors(["Network issue, please try again later"]);
            return;
          }
          setIsVisible(true);
        }
      );
  };

  const leaveConversation = () => {
    if (websockets.conversations?.connected) {
      websockets.conversations
        .timeout(1000)
        .emit(
          "leaveConversation",
          { id: props.currentConversation.id },
          (err: any) => {
            if (err) {
              setErrors(["Network issue, please try again later"]);
              return;
            }
            setTimeout(updateConvList, 100);
            props.selectConversation(null);
          }
        );
    }
  };

  const amIVisible = (conversationID: string) => {
    if (conversationID === props.currentConversation.id) setIsVisible(true);
  };

  const amIInvisible = (conversationID: string) => {
    if (conversationID === props.currentConversation.id) setIsVisible(false);
  };

  const removeConvPassword = (password: string) => {
    console.error("Removing password");
    websockets.conversations
      ?.timeout(1000)
      .emit(
        "removePassword",
        { id: props.currentConversation.id, password: password },
        (err: any, ret: boolean) => {
          console.error("callback: ", err, ret);
          if (err) {
            setErrors(["Please verify the password provided is correct"]);
            return;
          }
          setSuccess("Password successfully deleted");
          setHasPassword(false);
          setAddPassword(false);
          setUpdatePassword(false);
          setRemovePassword(false);
        }
      );
  };

  const addConvPassword = (password: string, confirmationPassword: string) => {
    websockets.conversations?.timeout(1000).emit(
      "addPassword",
      {
        id: props.currentConversation.id,
        password: password,
        confirmationPassword: confirmationPassword,
      },
      (err: any, ret: boolean) => {
        if (err) {
          setErrors(["Network issue, please try again later"]);
          return;
        }
        setSuccess("Password successfully added");
        setHasPassword(true);
        setAddPassword(false);
        setUpdatePassword(false);
        setRemovePassword(false);
      }
    );
  };

  const updateConvPassword = (
    oldPassword: string,
    password: string,
    confirmationPassword: string
  ) => {
    websockets.conversations?.timeout(1000).emit(
      "updatePassword",
      {
        id: props.currentConversation.id,
        oldPassword: oldPassword,
        password: password,
        confirmationPassword: confirmationPassword,
      },
      (err: any, ret: boolean) => {
        if (err) {
          setErrors(["Please verify the previous password is correct"]);
          return;
        }
        setSuccess("Password successfully updated");
        setHasPassword(true);
        setAddPassword(false);
        setUpdatePassword(false);
        setRemovePassword(false);
      }
    );
  };

  useEffect(() => {
    if (websockets.conversations?.connected) {
      websockets.conversations.on("isVisible", amIVisible);
      websockets.conversations.on("isInvisible", amIInvisible);
    }
    return () => {
      websockets.conversations?.off("isVisible", amIVisible);
      websockets.conversations?.off("isInvisible", amIInvisible);
    };
  }, []);

  return (
    <section>
      {props.self.current &&
      props.self.current.role === ConversationRoleEnum.OWNER ? (
        <>
          <article>
            {isVisible ? (
              <button onClick={makeInvisible}>Make invisible</button>
            ) : (
              <button onClick={makeVisible}>Make visible</button>
            )}
          </article>
          <article>
            {hasPassword ? (
              <>
                <button
                  onClick={() => {
                    setUpdatePassword(true), setRemovePassword(false);
                  }}
                >
                  Change password
                </button>
                <button
                  onClick={() => {
                    setRemovePassword(true), setUpdatePassword(false);
                  }}
                >
                  Remove password
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setAddPassword(true);
                }}
              >
                Add password
              </button>
            )}
          </article>
          {addPassword ? (
            <form
              onSubmit={(e) => {
                setErrors([]);
                e.preventDefault();
                const password = (
                  e.currentTarget.elements.namedItem(
                    "password"
                  ) as HTMLInputElement
                ).value;
                const confirmPassword = (
                  e.currentTarget.elements.namedItem(
                    "confirmation-password"
                  ) as HTMLInputElement
                ).value;
                if (!password.length) {
                  setErrors(["Please provide a non-empty password"]);
                  return;
                }
                if (password !== confirmPassword) {
                  setErrors(["Passwords do not match"]);
                  return;
                }
                addConvPassword(password, confirmPassword);
              }}
            >
              <input
                type="password"
                name="password"
                required
                placeholder="Password"
              />
              <input
                type="password"
                name="confirmation-password"
                required
                placeholder="Confirm password"
              />
              <input type="submit" value="Add password" />
            </form>
          ) : null}
          {updatePassword ? (
            <form
              onSubmit={(e) => {
                setErrors([]);
                e.preventDefault();
                const oldPassword = (
                  e.currentTarget.elements.namedItem(
                    "oldPassword"
                  ) as HTMLInputElement
                ).value;
                const password = (
                  e.currentTarget.elements.namedItem(
                    "password"
                  ) as HTMLInputElement
                ).value;
                const confirmPassword = (
                  e.currentTarget.elements.namedItem(
                    "confirmation-password"
                  ) as HTMLInputElement
                ).value;
                if (!oldPassword) {
                  setErrors(["Please enter the current password"]);
                  return;
                }
                if (!password.length) {
                  setErrors(["Please provide a non-empty password"]);
                  return;
                }
                if (password !== confirmPassword) {
                  setErrors(["Passwords do not match"]);
                  return;
                }
                updateConvPassword(oldPassword, password, confirmPassword);
              }}
            >
              <input
                type="password"
                name="oldPassword"
                required
                placeholder="Current password"
              />
              <input
                type="password"
                name="password"
                required
                placeholder="New password"
              />
              <input
                type="password"
                name="confirmation-password"
                required
                placeholder="Confirm password"
              />
              <input type="submit" value="Update password" />
            </form>
          ) : null}
          {removePassword ? (
            <form
              onSubmit={(e) => {
                setErrors([]);
                e.preventDefault();
                const password = (
                  e.currentTarget.elements.namedItem(
                    "password"
                  ) as HTMLInputElement
                ).value;
                if (!password.length) {
                  setErrors(["Please provide a non-empty password"]);
                  return;
                }
                removeConvPassword(password);
              }}
            >
              <input
                type="password"
                name="password"
                required
                placeholder="Current password"
              />
              <input type="submit" value="Remove password" />
            </form>
          ) : null}
          {props.participants.length > 1 ? (
            <article>Leave (pick a new owner if you want to leave)</article>
          ) : (
            <article onClick={leaveConversation}>Leave</article>
          )}
        </>
      ) : (
        <article onClick={leaveConversation}>Leave</article>
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
          style={{marginBottom: "5px"}}
            ref={searchRef}
            autoComplete="off"
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
                        (props.participants &&
                          props.participants.find(
                            (participant) =>
                              participant.user.name.toLowerCase() ===
                              res.name.toLowerCase()
                          ) !== undefined) ||
                        res.name === props.self.current?.user.name
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
          <section style={{paddingBottom: "5px"}}>
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
                          setMatches([]);
                        }, 500);
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
      ) : null}
    </section>
  );
}
