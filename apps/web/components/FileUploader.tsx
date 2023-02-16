import React, { SetStateAction } from "react";
import { useSelector } from "react-redux";
import { selectUserState } from "../store/UserSlice";
import hash from "object-hash";

const Button = ({
  onClick,
}: {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}): JSX.Element => {
  return (
    <button type="button" style={{ position: "absolute" }} onClick={onClick}>
      Change
    </button>
  );
};

async function handleFileUpload(
  userId: string,
  file: File | null
): Promise<boolean> {
  try {
    if (!file) throw new Error("file is undefined");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `/api/users/${userId}/update-profile-picture`,
      {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("access_token"),
        },
        body: formData,
      }
    );

    if (response.ok) {
      return true;
    } else {
      throw new Error(`${response}`);
    }
  } catch (error) {
    console.error("Error while uploading file", error);
    return false;
  }
}

const FileUploader = (props: {
  setFileHash: React.Dispatch<SetStateAction<string | null>>;
}): JSX.Element => {
  const UserState = useSelector(selectUserState);
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);

  function handleClick(): void {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  }

  async function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    const uploadedFile = event.target.files ? event.target.files[0] : null;
    if ((await handleFileUpload(UserState.id, uploadedFile)) === true) {
      props.setFileHash(hash(uploadedFile));
    } else {
      props.setFileHash(null);
      console.error("handle file failed");
    }
  }

  return (
    <>
      <Button onClick={handleClick} />
      <input
        type="file"
        ref={hiddenFileInput}
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </>
  );
};
export default FileUploader;
