import { Dispatch, SetStateAction, useRef, useState } from "react";
import { Userfront as User } from "types";
import { Input } from "./Input";
import { Conversation as ConversationEntity } from "types";
import ToggleCross from "../public/toggleCross.png";
import Image from "next/image";
import { useWebsocketContext } from "./Websocket";

interface createConversationProps {
  changeConversation: Dispatch<SetStateAction<ConversationEntity | null>>;
  closeCreator: Dispatch<SetStateAction<boolean>>;
}

export default function CreateConversation(
  props: createConversationProps
): JSX.Element {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const websockets = useWebsocketContext();

  const newConversation = (err: any, conversation: ConversationEntity) => {
    if (err)
    {
      setErrors(["Could not create conversation, please try again later"])
      return
    }
    props.changeConversation(conversation);
    props.closeCreator(false);
  };

  return (
    <>
      <h4>Create a new group conversation</h4>
      <section className="errors">
        {errors.map((error) => (
          <div>{error}</div>
        ))}
      </section>
      <form
        onSubmit={(e) => {
          setErrors([]);
          e.preventDefault();
          console.error("Submitting");
          const name = (
            e.currentTarget.elements.namedItem("name") as HTMLInputElement
          ).value;
          const password = (
            e.currentTarget.elements.namedItem("password") as HTMLInputElement
          ).value;
          const confirmedPassword = (
            e.currentTarget.elements.namedItem(
              "confirm-password"
            ) as HTMLInputElement
          ).value;
          if (!name.length)
            setErrors((prev) => [...prev, "Group conversations need a name"]);
          if (password.length) {
            if (!confirmedPassword.length)
              setErrors((prev) => [...prev, "Please confirm password"]);
            else if (password !== confirmedPassword)
              setErrors((prev) => [...prev, "Passwords do not match"]);
          }
          if (errors.length) return;
          const isVisible = (e.currentTarget.elements.namedItem("visible") as HTMLInputElement
          ).checked;
          console.error("Is visible? ", isVisible)
          if (!websockets.conversations?.connected) {
            setErrors((prev) => [
              ...prev,
              "Network error, please try again later",
            ]);
          }
          if (password.length)
            websockets.conversations?.timeout(2000).emit(
              "createConversation",
              {
                name: name,
                groupConversation: true,
                password: password,
                visible: isVisible
              },
              newConversation
            );
          else
            websockets.conversations?.timeout(2000).emit(
              "createConversation",
              {
                name: name,
                groupConversation: true,
                visible: isVisible
              },
              newConversation
            );
        }}
        ref={formRef}
      >
        <input
          autoFocus={true}
          name="name"
          placeholder="Conversation name"
          type="text"
        />
        <label htmlFor="visible">Is visible ?</label>
        <input type="checkbox" name="visible" id="visible" value="visible" />
        <label htmlFor="password">
          Enter a password if you wish to protect your conversation (optional)
        </label>
        <input type="password" name="password" id="password" />
        <input type="password" name="confirm-password" id="confirm-password" />
        <input type="submit" value="Create conversation" />
      </form>
    </>
  );
}
