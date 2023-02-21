  import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
  import { Userfront as User } from "types";
  import { Input } from "./Input";
  import { Conversation as ConversationEntity } from "types";
  import ToggleCross from "../public/toggleCross.png";
  import Image from "next/image";
  import { useWebsocketContext } from "./Websocket";
import Channel from "./Channel";

  interface SearchChannelProps {
    changeConversation: Dispatch<SetStateAction<ConversationEntity | null>>;
    closeSearchChannel: Dispatch<SetStateAction<boolean>>;
  }

  export default function SearchChannel(
    props: SearchChannelProps
  ): JSX.Element {
    const [errors, setErrors] = useState<string[]>([]);
    const [ channels, setChannels ] = useState<ConversationEntity[]>([])
    const [ matches, setMatches ] = useState<ConversationEntity[]>([])
    const websockets = useWebsocketContext();


    const updateChannelList = () =>
    {
      websockets.conversations?.timeout(2000).emit("getChannels", (err: any, conversations:ConversationEntity[]) => {
        if (err)
          return
        else
        {
          setChannels(conversations)
        }
      })
    }

    useEffect(() =>
    {
      if (!channels.length)
      {
        if (!websockets.conversations?.connected)
          setErrors(() => ["Temporary network issue, please try again later"])
        else
        {
          websockets.conversations.timeout(2000).emit("getChannels", (err: any, conversations:ConversationEntity[]) => {
            if (err)
            {
              setErrors(["Could not retrieve list of channels, please try again later"])
              return
            }
              setErrors([])
              setChannels(conversations)
              setMatches(conversations)
              websockets.conversations?.on("NewChannel", updateChannelList)
          })
        }
      }
      return (() => {websockets.conversations?.off("NewChannel", updateChannelList)})
    }, [websockets.conversations?.connected])

    return (
      <>
        <h4>Join a channel</h4>
        <section className="errors">
          {errors.map((error) => (
            <div>{error}</div>
          ))}
        </section>
        <section>
          <input type="text" onChange={(e) =>
          {
            if (!e.target.value.length)
            {
              setMatches(channels)
              return
            }
            else
            {
              const reg = new RegExp(e.target.value, "i")
              setMatches(channels.filter((currentChannel) => reg.test(currentChannel.name)))
            }
          }} />
        </section>
        <section>
          {matches.map((match) => < Channel changeConversation={props.changeConversation} closeSearchChannel={props.closeSearchChannel} setErrors={setErrors} current={match} />)}
        </section>
      </>
    );
  }
