import { useRouter } from "next/router";
import { createContext, ReactElement, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { identifyUser } from "../helpers/identifyUser";
import { selectUserState, setUserState } from "../store/UserSlice";
import { Loading } from "./Loading";

interface RoutesProps {
    children: ReactElement
}

export default function Routes({ children } : RoutesProps )
{
    const userState = useSelector(selectUserState);
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() =>
    {
        console.error("rerouting")
        console.error("pathname", router.pathname)
        console.error(window)
        if (!userState.id.length && !(router.pathname === '/login' || router.pathname === '/register'))
            {
                console.log("Not logged")
                setLoading(true)
                router.replace('/login')
            }
        else if (userState.id.length && (router.pathname === '/login' || router.pathname === 'register'))
        {
            console.log("Already logged")
            setLoading(true)    
            router.replace('/')
        }
        else {
            setLoading(false)
        }
    }, [router.pathname, userState])
    if (loading) return <Loading></Loading>
    return (
        <>
            { children }
        </>
    )
}