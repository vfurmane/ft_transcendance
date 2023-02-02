import Image from "next/image";
import { useSelector } from "react-redux";
import { selectUserState } from "../store/UserSlice";
import textStyles from 'styles/text.module.scss';
import styles from 'styles/profil.module.scss';

export default function MiniProfil (props : {left: boolean}) {
    const user = useSelector(selectUserState);
    return (
        <div style={{position: 'absolute', top: "250px", left: props.left? '20%' : '55%', width: '25%'}}>
            <div style={{display: 'flex', justifyContent: 'space-around'}}>
                {props.left?
                <div className="fill small">
                    <Image
                        alt="avatar"
                        src={`/avatar/avatar-${user.avatar_num}.png`}
                        width={42}
                        height={42}
                    />
                </div> 
                :
                 <p
                 style={{
                     color: "white",
                     fontSize: "20px",
                 }}
                 className={textStyles.saira}
                 >
                 level : {user.level}
                 <span
                     id="level"
                     className={textStyles.saira}
                     style={{ fontSize: "30px", color: "white"}}
                 ></span>
                 </p> }
                
                <h2
                className={textStyles.pixel}
                style={{
                    color: "white",
                    fontSize: "30px",
                    marginRight: "20px",
                    marginTop: "5px"
                }}
                >
                {user.name}
                </h2>

                {props.left? 
                <p
                style={{
                    color: "white",
                    fontSize: "20px",
                }}
                className={textStyles.saira}
                >
                level : {user.level}
                <span
                    id="level"
                    className={textStyles.saira}
                    style={{ fontSize: "30px", color: "white"}}
                ></span>
                </p>
                :
                <div className="fill small">
                    <Image
                        alt="avatar"
                        src={`/avatar/avatar-${user.avatar_num}.png`}
                        width={42}
                        height={42}
                    />
                </div>}
            </div>
            <div>
                <div style={{ width: "100%" }}>
                    <div className={styles.flex_between}>
                        <p className={textStyles.saira} style={{ color: "white" }}>
                        {user.victory} victory
                        </p>
                        <p className={textStyles.saira} style={{ color: "white" }}>
                        {user.defeat} defeat
                        </p>
                    </div>
                    <div className={`${styles.flex_between} ${styles.statBar}`}>
                        <div
                        style={{
                            height: "30px",
                            backgroundColor: "#03cea4",
                            width: `${Math.floor(
                            (user.victory / (user.defeat + user.victory)) * 100
                            )}%`,
                        }}
                        ></div>
                        <div
                        style={{
                            height: "30px",
                            backgroundColor: "#e22d44",
                            width: `${Math.floor(
                            (user.defeat / (user.defeat + user.victory)) * 100
                            )}%`,
                        }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}