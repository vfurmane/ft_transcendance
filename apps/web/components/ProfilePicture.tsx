import React from "react";
import styles from "../styles/ProfilePicture.module.scss";

const ProfilePicture = (props: {
  userId: string;
  width: number;
  height: number;
  fileHash?: string | null;
  handleClick:
    | ((event: React.MouseEvent<HTMLImageElement>) => void)
    | undefined;
}): JSX.Element => {
  return (
    <>
      <img
        className={styles.profilePicture}
        alt="avatar"
        width={props.width}
        height={props.height}
        src={`/api/users/${props.userId}/profile-picture?f=${props.fileHash}`}
        onClick={props.handleClick}
      />
    </>
  );
};
export default ProfilePicture;
