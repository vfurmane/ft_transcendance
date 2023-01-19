import textStyles from "styles/text.module.scss";

export default function ChangePswrd(): JSX.Element {
  return (
    <form
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h2 className={textStyles.pixel} style={{ color: "white" }}>
        Change password
      </h2>
      <h3 className={textStyles.laquer}>Enter current password</h3>
      <input></input>
      <h3 className={textStyles.laquer}>Enter new password</h3>
      <input></input>
      <h3 className={textStyles.laquer}>Confirm new password</h3>
      <input></input>
      <button type="submit">submit</button>
    </form>
  );
}
