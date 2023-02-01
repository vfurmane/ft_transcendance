import { createContext, ReactElement, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { identifyUser } from "../helpers/identifyUser";
import { selectUserState, setUserState } from "../store/UserSlice";

interface AuthProps {
    children: ReactElement
}

export default function Auth({ children } : AuthProps )
{
    const userState = useSelector(selectUserState);
    const dispatch = useDispatch()

    useEffect(() =>
    {
        const fetchUser = async () => {
            const user = await identifyUser();
            if (user)
                dispatch(setUserState(user))
        }

        if (userState === undefined || userState.id === undefined || !userState.id.length)
        {
            fetchUser()
        }
    }, [])
    return (
        <>
            { children }
        </>
    )
}