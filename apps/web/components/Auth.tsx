import { useRouter } from "next/router";
import { ReactElement, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { identifyUser } from "../helpers/identifyUser";
import { refreshToken } from "../helpers/refreshTokens";
import { initUser } from "../initType/UserInit";
import { selectUserState, setUserState } from "../store/UserSlice";
import { Loading } from "./Loading";

interface AuthProps {
  children: ReactElement;
}

export default function Auth({ children }: AuthProps): JSX.Element {
  const userState = useSelector(selectUserState);
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const refreshInterval = useRef<NodeJS.Timer | null>(null);

  useEffect((): (() => void) => {
    const fetchUser = async (): Promise<void> => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
        refreshInterval.current = null;
      }
      const user = await identifyUser(loading);
      if (user) {
        dispatch(setUserState(user));
        refreshInterval.current = setInterval(async () => {
          if (!(await refreshToken()) && refreshInterval) {
            if (refreshInterval.current)
              clearInterval(refreshInterval.current);
            refreshInterval.current = null;
            dispatch(setUserState(initUser));
            router.push("/auth/login");
          }
        }, 1000 * 60 * 4);
      } else {
        dispatch(setUserState(initUser));
      }
      setLoading(false);
    };
    fetchUser();
    return (): void => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
      refreshInterval.current  = null;
    };
  }, [userState.id]);
  if (loading) return <Loading></Loading>;
  return <>{children}</>;
}
