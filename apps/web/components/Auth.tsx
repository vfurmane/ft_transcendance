import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
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
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timer | null>(
    null
  );

  useEffect((): (() => void) => {
    const fetchUser = async (): Promise<void> => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
      const user = await identifyUser();
      if (user) {
        dispatch(setUserState(user));
        setRefreshInterval(setInterval(async () => {
          if (!(await refreshToken()) && refreshInterval) {
            clearInterval(refreshInterval);
            setRefreshInterval(null);
            dispatch(setUserState(initUser));
            router.push("/auth/login");
          }
        }, 1000 * 60 * 4));
      } else {
        dispatch(setUserState(initUser));
      }
      setLoading(false);
    };
    fetchUser();
    return (): void => {
      if (refreshInterval) clearInterval(refreshInterval);
      setRefreshInterval(null);
    };
  }, [userState.id]);
  if (loading) return <Loading></Loading>;
  return <>{children}</>;
}
