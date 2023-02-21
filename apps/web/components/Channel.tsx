import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Userfront as User } from "types";
import { Input } from "./Input";
import { Conversation as ConversationEntity } from "types";
import ToggleCross from "../public/toggleCross.png";
import Image from "next/image";
import { useWebsocketContext } from "./Websocket";

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
        return < React.Fragment key={props.current.id}>
        <aside>{props.current.has_password ? "protected" : ""}</aside>
        <article>{props.current.name}</article>
        <form onBlur={(e) =>
        {
            setAskPassword(false)
      }} onSubmit={ (e) =>
        {
            // props.setErrors([])
          e.preventDefault()
            const password = (e.currentTarget.elements.namedItem("conversationPassword") as HTMLInputElement
            ).value;
            websockets.conversations?.timeout(500).emit("joinConversation", { id: props.current.id, password: password }, joinConversation)
        }}>
      <input type="password" name="conversationPassword" id="" />
      <input type="submit" value="JOIN" /> </form >
        </React.Fragment>
      }

    return < React.Fragment key={props.current.id}>
        <aside>{props.current.has_password ? "protected" : ""}</aside>
        <article>{props.current.name}</article>
        <article onClick={ (e) =>
        {
            // props.setErrors([])
            if (props.current.has_password)
                setAskPassword(true)
            else
                websockets.conversations?.timeout(500).emit("joinConversation", { id: props.current.id }, joinConversation)
        }}>JOIN</article>
    </ React.Fragment>
}