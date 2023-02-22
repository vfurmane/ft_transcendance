import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUserState } from "../store/UserSlice";
import { Loading } from "./Loading";

interface RoutesProps {
  children: ReactElement;
}

export default function Routes({ children }: RoutesProps): JSX.Element {
  const userState = useSelector(selectUserState);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect((): void => {
    const isProtected = !/^\/auth\//.test(router.pathname);
    if (!userState.id.length && isProtected) router.replace("/auth/login");
    else if (userState.id.length && !isProtected) router.replace("/");
    else if (userState.gameId) router.replace(`/pingPong/${userState.gameId}`)
    else setLoading(false);
  }, [router.pathname, userState.id]);
  if (loading) return <Loading></Loading>;
  return <>{children}</>;
}
