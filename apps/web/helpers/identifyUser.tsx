import { useDispatch, useSelector } from "react-redux";
import { User } from "types";
import { selectUserState, setUserState } from "../store/UserSlice";

export async function identifyUser() {
    const response = await fetch('/api/users/profile',
    {
        headers:
        {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        }
    })
    if (!response.ok)
        return null
    return response.json() as Promise<User>
}