import React, { useState } from "react";
import FileUploader from "./FileUploader";
import ProfilePicture from "./ProfilePicture";
import styles from "../styles/ProfilePictureUploader.module.scss";

const ProfilePictureUploader = (props: { userId: string }): JSX.Element => {
  const [fileHash, setFileHash] = useState<string | null>("");
  return (
    <>
      <div className={styles.profilePictureUploader}>
        <ProfilePicture userId={props.userId} fileHash={fileHash} />
        <FileUploader setFileHash={setFileHash} />
      </div>
    </>
  );
};
export default ProfilePictureUploader;
