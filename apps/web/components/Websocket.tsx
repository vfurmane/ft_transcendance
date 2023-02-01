import { NextComponentType, NextPageContext } from "next";
import { createContext, ReactElement, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket, SocketOptions } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { selectUserState, setUserState } from "../store/UserSlice";

const WebsocketContext = createContext<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

interface WebsocketProps {
    children: ReactElement
}

export default function Websocket({ children } : WebsocketProps )
{
    const [socketInstances, setSocketInstances] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
    const userState = useSelector(selectUserState);
    // console.error("check")
    // console.error(children)

    useEffect(() => {
        if (userState !== undefined && userState.id !== undefined
            && userState.id.length && typeof window !== 'undefined')
        {
            console.error("connecting")
            const socket = io("/conversations", {
                auth: {
                    token : localStorage.getItem("access_token")
                }
            });
            socket.on("connect", ()=> {console.error("socket is connected")})
            socket.on("disconnect", ()=> {console.error("socket is disconnected")})
            socket.on("connect_error", ()=> {console.error("error while trying to connect ot socket")})
            setSocketInstances(socket);
        }
        else
        {
            if (socketInstances)
            {
                socketInstances.off("connect")
                socketInstances.off("connect_error")
                socketInstances.off("disconnect")
                socketInstances.close()
                setSocketInstances(null)
            }
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
    }, [userState])
    return (

        <WebsocketContext.Provider value={socketInstances}>
            { children }
        </WebsocketContext.Provider>
    )
}

export const useWebsocketContext = () => useContext(WebsocketContext)