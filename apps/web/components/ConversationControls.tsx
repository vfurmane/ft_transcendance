import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Conversation as ConversationEntity, ConversationRole } from "types";
import { selectUserState } from "../store/UserSlice";
import styles from "styles/conversationControls.module.scss";
import Image from "next/image";
import ToggleBar from "../public/toggleBar.png";
import { selectConversationsState } from "../store/ConversationSlice";

interface conversationControlsProps {
  newConversation: { userId: string; userName: string } | null;
  conversation: ConversationEntity | null;
  name: string | undefined;
  visibility: boolean;
  setVisibility: Dispatch<SetStateAction<boolean>>;
}

export default function ConversationControls(
  props: conversationControlsProps
): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const conversationToOpen = useSelector(selectConversationsState);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return <></>;
  if (!props.visibility) {
    return (
      <section className={styles.conversationControls}>
        <p className={styles.conversationName}>
          {props.name ? props.name : conversationToOpen.userName}
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
        {props.name ? props.name : conversationToOpen.userName}
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
