  import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
  import { Userfront as User } from "types";
  import { Input } from "./Input";
  import { Conversation as ConversationEntity } from "types";
  import ToggleCross from "../public/toggleCross.png";
  import Image from "next/image";
  import { useWebsocketContext } from "./Websocket";
import Channel from "./Channel";
import styles from "styles/searchChannel.module.scss";

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
    const [ loading, setLoading ] = useState<boolean>(true)
    const entered = useRef<string | null>("")


    const updateChannelList = () =>
    {
      console.error("New Channel")
      websockets.conversations?.timeout(500).emit("getChannels", (err: any, conversations:ConversationEntity[]) => {
        if (err)
        {
          console.error("Could not retrieve list")
          return
        }
        else
        {
          setChannels(conversations)
          if (entered.current && entered.current.length)
          {
              const reg = new RegExp(entered.current, "i")
              setMatches(conversations.filter((currentChannel) => reg.test(currentChannel.name)))
            }
            else
              setMatches(conversations)
          }
      })
    }

    useEffect(() =>
    {
      if (loading)
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
        setLoading(false)
      }
      return (() => {websockets.conversations?.off("NewChannel", updateChannelList)})
    }, [websockets.conversations?.connected])

    if (loading)
      return <></>

    return (
      <section className={ styles.searchChannelsContainer }>
        <h4>Join a channel</h4>
        <section className={ styles.errors }>
          {errors.map((error, i) => (
            <div key={`joinerror_${i}`}>{error}</div>
          ))}
        </section>
        <section>
          <input placeholder="Channel name" className={ styles.searchChannelBar } autoComplete="off" type="text" onChange={(e) =>
          {
            entered.current = e.target.value
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
        <section className={ styles.matchesContainer }>
          {matches.map((match) => < Channel changeConversation={props.changeConversation} closeSearchChannel={props.closeSearchChannel} setErrors={setErrors} current={match} />)}
        </section>
      </section>
    );
  }
