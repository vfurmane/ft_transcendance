import React from "react";
import { useSelector } from "react-redux";
import { selectUserState } from "../store/UserSlice";
import styles from "../styles/ProfilePicture.module.scss";

const ProfilePicture = (props: {
  userId: string;
  width: number;
  height: number;
  fileHash?: string | null;
  handleClick?: (event: React.MouseEvent<HTMLImageElement>) => void;
}): JSX.Element => {
  const UserState = useSelector(selectUserState);
  const hash = UserState.avatarHash ? `?f=${UserState.avatarHash}` : "";
  if (!props.userId) return <></>;
  return (
    <>
      <img
        className={styles.profilePicture}
        alt="avatar"
        width={props.width}
        height={props.height}
        src={`/api/users/${props.userId}/profile-picture${hash}`}
        onClick={props.handleClick}
      />
    </>
  );
};
export default ProfilePicture;
