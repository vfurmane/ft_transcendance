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
    if (
      !userState.id.length &&
      !(router.pathname === "/login" || router.pathname === "/register")
    ) {
      router.replace("/login");
    } else if (
      userState.id.length &&
      (router.pathname === "/login" || router.pathname === "register")
    ) {
      router.replace("/");
    } else {
      setLoading(false);
    }
  }, [router.pathname, userState]);
  if (loading) return <Loading></Loading>;
  return <>{children}</>;
}
