import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Userfront as User } from "types";
import { Input } from "./Input";
import { Conversation as ConversationEntity } from "types";
import ToggleCross from "../public/toggleCross.png";
import Image from "next/image";
import { useWebsocketContext } from "./Websocket";
import styles from "styles/channel.module.scss";
import lockedPadlock from "../public/lockedPadlock.png";

interface ChannelProps {
    changeConversation: Dispatch<SetStateAction<ConversationEntity | null>>;
    closeSearchChannel: Dispatch<SetStateAction<boolean>>;
    setErrors: Dispatch<SetStateAction<string[]>>;
    current: ConversationEntity
  }

export default function Channel( props : ChannelProps )
{
    const websockets = useWebsocketContext();
    const [ askPassword, setAskPassword ] = useState<boolean>(false)

    const joinConversation = (err: any, conversation: ConversationEntity) => {
        if (err)
        {
          props.setErrors(["Could not join conversation, please try again later or verify password"])
          setAskPassword(false)
          return
        }
        props.changeConversation(conversation);
        props.closeSearchChannel(false);
      };

      if (askPassword)
      {
        return < section key={props.current.id} className={ styles.channelForm }>
            
        <aside className={ styles.lockedField } >{props.current.has_password ? 
        < Image src={lockedPadlock} width={20} height={20} alt="padlock" />
        : <></>}</aside>
        <section className={ styles.channelInfo }>
        <article className={ styles.channelName }><p>{props.current.name}</p></article>

        <form onSubmit={ (e) =>
        {
          e.preventDefault()
          props.setErrors([])
            const password = (e.currentTarget.elements.namedItem("conversationPassword") as HTMLInputElement
            ).value;
            websockets.conversations?.timeout(500).emit("joinConversation", { id: props.current.id, password: password }, joinConversation)
        }}>
      <input type="password" name="conversationPassword" placeholder="Enter password" className={ styles.passwordField } />
      <div className={ styles.joinButton }>
      <input type="submit" value="JOIN" className={ styles.submitWithPwd} /></div> </form >
      </section>
        </section>
      }

    return < section key={props.current.id} className={ styles.channelNoForm }>
        <aside className={ styles.lockedField } >{props.current.has_password ? 
        < Image src={lockedPadlock} width={20} height={20} alt="padlock" />
        : <></>}</aside>
        <article className={ styles.channelName }><p>{props.current.name}</p></article>
        <article className={ styles.joinButton } ><p onClick={ (e) =>
        {
            props.setErrors([])
            if (props.current.has_password)
                setAskPassword(true)
            else
                websockets.conversations?.timeout(500).emit("joinConversation", { id: props.current.id }, joinConversation)
        }}>JOIN</p></article>
    </ section>
}