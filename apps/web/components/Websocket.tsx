import { NextComponentType, NextPageContext } from "next";
import { createContext, ReactElement, useContext, useEffect, useMemo, useState } from "react";
import { io, Socket, SocketOptions } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { useAuthContext } from "./Auth";

const WebsocketContext = createContext<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

interface WebsocketProps {
    children: ReactElement
}

export default function Websocket({ children } : WebsocketProps )
{
    const [socketInstances, setSocketInstances] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
    const { currentUser } = useAuthContext()
    // console.error("check")
    // console.error(children)

    useEffect(() => {
        console.error("In websocket component")
        console.error("type of window: ", typeof window)
        if (typeof window !== 'undefined' && currentUser.id.length)
        {
            console.error("connecting")
            const socket = io("/conversations");
            socket.on("connect", ()=> {console.error("socket is connected")})
            socket.on("disconnect", ()=> {console.error("socket is disconnected")})
            socket.on("connect_error", ()=> {console.error("error while trying to connect ot socket")})
            setSocketInstances(socket);
        }
        return () => {
            if (socketInstances)
            {
                socketInstances.off("connect")
                socketInstances.off("connect_error")
                socketInstances.off("disconnect")
                socketInstances.close()
                setSocketInstances(null)
            }
        }
    }, [currentUser])
    return (

        <WebsocketContext.Provider value={socketInstances}>
            { children }
        </WebsocketContext.Provider>
    )
}

export const useWebsocketContext = () => useContext(WebsocketContext)