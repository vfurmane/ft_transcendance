import styles from "styles/ConfigTfa/index.module.scss";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUserState, toggleTfa } from "../../../store/UserSlice";
import { ManageTfa } from "./ManageTfa";
import { SetupTfa } from "./SetupTfa";
import { CheckTfaToken } from "./CheckTfaToken";
import { useWebsocketContext } from "../../Websocket";

export default function ConfigTfa(): JSX.Element {
  const userState = useSelector(selectUserState);
  const dispatch = useDispatch();
  const [otpAuthUrl, setOtpauthUrl] = useState<string | null>(null);
  const [layout, setLayout] = useState(
    <SetupTfa setOtpauthUrl={setOtpauthUrl} />
  );
  const websocket = useWebsocketContext();

  useEffect(() => {
    console.log(userState);
    if (userState.tfaSetup) {
      setLayout(
        <ManageTfa
          success={(): void => {
            dispatch(toggleTfa());
          }}
        />
      );
    } else if (otpAuthUrl !== null) {
      setLayout(
        <CheckTfaToken
          otpAuthUrl={otpAuthUrl}
          success={(): void => {
            dispatch(toggleTfa());
            setOtpauthUrl(null);
          }}
        />
      );
    } else setLayout(<SetupTfa setOtpauthUrl={setOtpauthUrl} />);
  }, [otpAuthUrl, userState, dispatch]);

  useEffect(() => {
    if (websocket.general) {
      websocket.general.on("settings_changed", () => {
        console.log("new settings");
      });
    }
  }, []);

  return (
    <div className={styles.container}>
      <h3>Two-factor authentication</h3>
      <p>Secure your account with TFA and keep intruders out!</p>
      {layout}
    </div>
  );
}
