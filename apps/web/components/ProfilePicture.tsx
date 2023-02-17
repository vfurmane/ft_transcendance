import React from "react";
import styles from "../styles/ProfilePicture.module.scss";

const ProfilePicture = (props: {
  userId: string;
  width: number;
  height: number;
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
        src={`/api/users/${props.userId}/profile-picture`}
        onClick={props.handleClick}
      />
    </>
  );
};
export default ProfilePicture;
