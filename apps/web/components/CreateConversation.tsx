import { Dispatch, SetStateAction, useRef, useState } from "react"
import { Userfront as User } from "types";
import { Input } from "./Input"
import { Conversation as ConversationEntity } from "types"
import ToggleCross from "../public/toggleCross.png";
import Image from "next/image";
import { useWebsocketContext } from "./Websocket";

interface createConversationProps
{
  changeConversation: Dispatch<SetStateAction<ConversationEntity | null>>
  closeCreator: Dispatch<SetStateAction<boolean>>
}

export default function CreateConversation(  props : createConversationProps ) : JSX.Element
{
    const formRef = useRef<HTMLFormElement | null>(null)
    const searchRef = useRef<HTMLInputElement>(null)
    const [ participants, setParticipants ] = useState<User[]>([])
    const [ matches, setMatches ] = useState<User[]>([])
    const [ errors, setErrors ] = useState<string[]>([])
    const websockets = useWebsocketContext();

    const newConversation = (conversation : ConversationEntity) => {
        props.changeConversation(conversation);
        props.closeCreator(false)
    }

    return (
        <>
        <h4>Create a new group conversation</h4>
        <section className="errors">
          { errors.map((error) => <div>{ error }</div>) }
        </section>
        <form onSubmit={ (e) => 
        {
          setErrors([])
            e.preventDefault()
            console.error("Submitting")
            const name = (e.currentTarget.elements.namedItem("name") as HTMLInputElement).value
            const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value
            const confirmedPassword = (e.currentTarget.elements.namedItem("confirm-password") as HTMLInputElement).value
            if (!name.length)
              setErrors((prev) => [...prev, "Group conversations need a name"])
            if (!participants.length)
              setErrors((prev) => [...prev, "Please pick participants for you conversation (you will be able to add more later)"])
            if (password.length)
            {
              if (!confirmedPassword.length)
                setErrors((prev) => [...prev, "Please confirm password"])
              else if (password !== confirmedPassword)
                setErrors((prev) => [...prev, "Passwords do not match"])
            }
            if (errors.length)
              return
            if (websockets.conversations?.connected)
            {
              setErrors((prev) => [...prev, "Network error, please try again later"])
            }
            const participantsList = participants.map((participant) => participant.id)
            if (password.length)
              websockets.conversations?.emit("createConversation", {name : name, groupConversation: true, password: password, participants: participantsList}, newConversation)
            else
              websockets.conversations?.emit("createConversation", {name : name, groupConversation: true, participants: participantsList}, newConversation)
        }} ref={ formRef }>
        <input autoFocus={true} name="name" placeholder="Conversation name" type="text" />
        <div></div>
        <input ref={ searchRef } name="participants" placeholder="Search a user" type="text" onChange={ (e) =>
        {
            if (!e.target.value.length)
            {
                setMatches([...[]])
                return
            }
            fetch(`/api/search?letters=${e.target.value}`, {
                    headers: {
                      Authorization: "Bearer " + localStorage.getItem("access_token"),
                    },
                  })
                    .then((response) => {
                    if (!response.ok)
                        return
                    response.json().then((data) => {
                        setMatches([...data]);
                      });
                    })
                    .catch(function (error) {
                      console.log(
                        "Il y a eu un problème avec l'opération fetch : " + error.message
                      );
                    });
        }} /*onBlur={ (e) => 
        {
            e.target.value = ""
            setMatches([...[]])
         }}*/ />
        <section>{ matches.map((el) => <article key={el.id} onClick={(e) =>
        {
            setParticipants((prev) => prev.filter((e) => e.id === el.id).length ? prev : [...prev, el] )
            if (searchRef.current)
              searchRef.current.value = ""
            setMatches([])
        }} >{el.name}</article>)}</section>
        <section>
          { participants.map((participant) => <article>{ participant.name }<aside><Image alt="toggle" src={ToggleCross} /></aside></article>) }
        </section>
        <label htmlFor="password">Enter a password if you wish to protect your conversation (optional)</label>
        <input type="password" name="password" id="password" />
        <input type="password" name="confirm-password" id="confirm-password" />
        <input type="submit" value="Create conversation" />
        </form>
        </>
    )
}