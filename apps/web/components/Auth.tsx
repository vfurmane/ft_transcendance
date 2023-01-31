import { createContext, ReactElement, useContext, useEffect, useState } from "react";

interface AuthProps {
    children: ReactElement
}

interface AuthUser
{
    id: string,
    name: string,
}

interface AuthContextInterface
{
    currentUser: AuthUser,
    setCurrentUser: (user : AuthUser) => void
}

const AuthContext = createContext<AuthContextInterface>({
    currentUser: {id: "", name: ""},
    setCurrentUser: () => {}
});

export default function Auth({ children } : AuthProps )
{
    const [currentUser, setCurrentUser] = useState<AuthUser>({name:"", id:""});

    return (

        <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
            { children }
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => useContext(AuthContext)