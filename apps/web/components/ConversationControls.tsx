import { Dispatch, SetStateAction, useState } from "react";
import { useSelector } from "react-redux";
import { Conversation as ConversationEntity, ConversationRole } from "types";
import { selectUserState } from "../store/UserSlice";
import styles from "styles/conversationControls.module.scss";
import Image from "next/image";
import ToggleBar from "../public/toggleBar.png";

interface conversationControlsProps {
  newConversation: { userId: string; userName: string } | null;
  conversation: ConversationEntity | null;
  visibility: boolean;
  setVisibility: Dispatch<SetStateAction<boolean>>;
}

export default function ConversationControls(
  props: conversationControlsProps
): JSX.Element {
  const userState = useSelector(selectUserState);

  if (!props.visibility) {
    return (
      <section className={styles.conversationControls}>
        <p className={styles.conversationName}>
          {props.conversation
            ? (props.conversation.groupConversation ? props.conversation.name :
              props.conversation.conversationRoles.find((role) => role.user.id !== userState.id)?.user.name)
            : props.newConversation?.userName}
        </p>
        <section
          className={styles.conversationMenu}
          onClick={() => {
            props.setVisibility(true);
          }}
        >
          <Image src={ToggleBar} alt="toggle bar" />
        </section>
      </section>
    );
  }
  return (
    <section className={styles.conversationControls}>
      <p className={styles.conversationName}>
      {props.conversation
            ? (props.conversation.groupConversation ? props.conversation.name :
              props.conversation.conversationRoles.find((role) => role.user.id !== userState.id)?.user.name)
            : props.newConversation?.userName}
      </p>
      <section
        className={styles.conversationMenu}
        onClick={() => {
          props.setVisibility(false);
        }}
      >
        <Image src={ToggleBar} alt="toggle bar" />
      </section>
      </section>
  );
}
