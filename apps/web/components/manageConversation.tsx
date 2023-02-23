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
import styles from "../styles/manageConversation.module.scss";

interface manageConversationProps {
  currentConversation: ConversationEntity;
  selectConversation: Dispatch<SetStateAction<ConversationEntity | null>>;
  self: MutableRefObject<ConversationRole | null>;
  participants: ConversationRole[];
  updateConversationList: Dispatch<SetStateAction<ConversationWithUnread[]>>;
  visibility: {
    conversationVisibility: boolean;
    setConversationVisibility: Dispatch<SetStateAction<boolean>>;
};
password: {
  conversationPassword: boolean;
  setConversationPassword: Dispatch<SetStateAction<boolean>>;
}

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
    props.visibility.conversationVisibility
  );
  const [hasPassword, setHasPassword] = useState<boolean>(
    props.password.conversationPassword
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

  useEffect(() =>
  {
    websockets.conversations?.on("userJoined", () => {setTimeout(updateConvList, 500)})
    websockets.conversations?.on("userLeft", () => {setTimeout(updateConvList, 500)})
  },[])

  const makeInvisible = () => {
    websockets.conversations
      ?.timeout(1000)
      .emit(
        "makeInvisible",
        { id: props.currentConversation.id },
        (err: any, ret: boolean) => {
          if (err) {
            setErrors(["Network issue, please try again later"]);
            return;
          }
          setIsVisible(false);
          props.visibility.setConversationVisibility(false)
        }
      );
  };

  const makeVisible = () => {
    websockets.conversations
      ?.timeout(1000)
      .emit(
        "makeVisible",
        { id: props.currentConversation.id },
        (err: any, ret: boolean) => {
          if (err) {
            setErrors(["Network issue, please try again later"]);
            return;
          }
          setIsVisible(true);
          props.visibility.setConversationVisibility(true)
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
    if (conversationID === props.currentConversation.id)
    {
      setIsVisible(true);
      props.visibility.setConversationVisibility(true)
    }
  };

  const amIInvisible = (conversationID: string) => {
    if (conversationID === props.currentConversation.id)
    {
      setIsVisible(false);
      props.visibility.setConversationVisibility(false)
    }
  };

  const removeConvPassword = (password: string) => {
    websockets.conversations
      ?.timeout(1000)
      .emit(
        "removePassword",
        { id: props.currentConversation.id, password: password },
        (err: any, ret: boolean) => {
          if (err) {
            setErrors(["Please verify the password provided is correct"]);
            return;
          }
          setSuccess("Password successfully deleted");
          setHasPassword(false);
          props.password.setConversationPassword(false)
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
        props.password.setConversationPassword(true)
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
        props.password.setConversationPassword(true)
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
    <section className={styles.manageContainer}>
      {props.self.current &&
      props.self.current.role === ConversationRoleEnum.OWNER ? (
        <>
          <article>
            {isVisible ? (
              <button className={ styles.ownerButton } onClick={makeInvisible}>Make invisible</button>
            ) : (
              <button className={ styles.ownerButton } onClick={makeVisible}>Make visible</button>
            )}
          </article>
          <article>
            {hasPassword ? (
              <>
                <button className={ styles.ownerButton }
                  onClick={() => {
                    setUpdatePassword(true), setRemovePassword(false);
                  }}
                >
                  Change password
                </button>
                <button className={ styles.ownerButton }
                  onClick={() => {
                    setRemovePassword(true), setUpdatePassword(false);
                  }}
                >
                  Remove password
                </button>
              </>
            ) : (
              <button className={ styles.ownerButton }
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
              className={styles.inputField}
                type="password"
                name="password"
                required
                placeholder="Password"
              />
              <input
              className={styles.inputField}
                type="password"
                name="confirmation-password"
                required
                placeholder="Confirm password"
              />
              <input className={ styles.ownerButton } type="submit" value="Confirm" />
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
              className={styles.inputField}
                type="password"
                name="oldPassword"
                required
                placeholder="Current password"
              />
              <input
              className={styles.inputField}
                type="password"
                name="password"
                required
                placeholder="New password"
              />
              <input
              className={styles.inputField}
                type="password"
                name="confirmation-password"
                required
                placeholder="Confirm password"
              />
              <input className={ styles.ownerButton } type="submit" value="Confirm" />
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
              className={styles.inputField}
                type="password"
                name="password"
                required
                placeholder="Current password"
              />
              <input className={ styles.ownerButton } type="submit" value="Confirm" />
            </form>
          ) : null}
          {props.participants.length > 1 ? (
            <article style={{color: "red", margin: "5px 5px"}}>Leave : (pick a new owner if you want to leave)</article>
          ) : (
            <article className={ styles.ownerButton } onClick={leaveConversation}>Leave</article>
          )}
        </>
      ) : (
        <article className={ styles.ownerButton } onClick={leaveConversation}>Leave</article>
      )}
      <div className={ styles.ownerButton }
        onClick={() => {
          setDisplaySearchBox(true);
        }}
      >
        Invite someone
      </div>
      {displaySearchBox ? (
        <>
          <input
          className={styles.inputField}
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
          <section className={styles.matchesContainer} style={{paddingBottom: "5px"}}>
            {matches.map((el) => (
              <article className={styles.matches}
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
      <section className={styles.error}>
            {errors.map((error, i) => (
              <div key={`error_${i}`}>{error}</div>
            ))}
          </section>
          <section className={styles.success}>
            {success.length ? <div>{success}</div> : <></>}
          </section>
    </section>
  );
}
