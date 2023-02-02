import { NextComponentType, NextPageContext } from "next";
import { createContext, ReactElement, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket, SocketOptions } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { selectUserState, setUserState } from "../store/UserSlice";


interface WebsocketProps {
    children: ReactElement
}

interface OpenedSockets
{
    general : Socket<DefaultEventsMap, DefaultEventsMap> | null,
    conversations: Socket<DefaultEventsMap, DefaultEventsMap> | null,
    pong : Socket<DefaultEventsMap, DefaultEventsMap> | null
}

const WebsocketContext = createContext<OpenedSockets | null>(null);

const deregisterSocket = (socket : Socket<DefaultEventsMap, DefaultEventsMap>) => {
    socket.off("connect")
    socket.off("connect_error")
    socket.off("disconnect")
    socket.close()
}

const closeOpenSockets = (sockets : OpenedSockets) =>
{
    if (sockets.general)
        deregisterSocket(sockets.general)
    if (sockets.conversations)
        deregisterSocket(sockets.conversations)
    if (sockets.pong)
        deregisterSocket(sockets.pong)
}
const OpenSocket = (namespace: string) =>
{
    const newSocket = io(namespace, {
        auth: {
            token : localStorage.getItem("access_token")
        }
    });
    newSocket.on("connect", ()=> {console.error(`socket ${namespace} is connected`)})
    newSocket.on("disconnect", ()=> {console.error(`socket ${namespace} is disconnected`)})
    newSocket.on("connect_error", ()=> {console.error(`Error while trying to connect ot socket ${namespace}`)})
    return newSocket
}

export default function Websocket({ children } : WebsocketProps )
{
    const [socketInstances, setSocketInstances] = useState<OpenedSockets>({general: null, conversations: null, pong: null});
    const userState = useSelector(selectUserState);
    // console.error("check")
    // console.error(children)

    useEffect(() => {
        console.error("user state in websocket: ", userState)
        if (userState.id)
        {
            console.error("connecting")
            const general = OpenSocket("/")
            const conversations = OpenSocket("/conversations")
            const pong = OpenSocket("/pong")
            setSocketInstances({general: general, conversations: conversations, pong: pong});
        }
        else
        {
            closeOpenSockets(socketInstances)
            setSocketInstances({general: null, conversations: null, pong: null})
        }
        return () => {
            if (socketInstances)
            {
                closeOpenSockets(socketInstances)
                setSocketInstances({general: null, conversations: null, pong: null})
            }
        }
    }, [userState.id])
    return (

        <WebsocketContext.Provider value={socketInstances}>
            { children }
        </WebsocketContext.Provider>
    )
}

export const useWebsocketContext = () => useContext(WebsocketContext)