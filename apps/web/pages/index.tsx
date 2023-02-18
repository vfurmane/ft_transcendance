import { useEffect, useState } from "react";
import Home from "./home";
import { Loading } from "../components/Loading";

export default function Web(): JSX.Element {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return <Loading></Loading>;

  return (
    <div>
      <Home />
    </div>
  );
}
