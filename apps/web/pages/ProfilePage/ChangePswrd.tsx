export default function ChangePswrd() : JSX.Element {
    return (
        <form style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
            <h2 style={{color:'white'}}>Change password</h2>
            <h3>Enter current password</h3>
            <input></input>
            <h3>Enter new password</h3>
            <input></input>
            <h3>Confirm new password</h3>
            <input></input>
            <button type="submit">submit</button>
        </form>
    );
}