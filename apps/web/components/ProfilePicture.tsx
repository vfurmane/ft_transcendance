import React, { useEffect, useState } from "react";
import styles from "../styles/ProfilePicture.module.scss";

const ProfilePicture = (props: {
  userId: string;
  fileHash: string | null;
}): JSX.Element => {
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (props.fileHash === null) {
      setErrorMessage("Unexpected error, please try again");
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  }, [props.fileHash]);

  return (
    <>
      <div className={styles.container}>
        <img
          className={styles.avatar}
          alt="avatar"
          src={`/api/users/${props.userId}/profile-picture?f=${props.fileHash}`}
        />
        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
      </div>
    </>
  );
};
export default ProfilePicture;
