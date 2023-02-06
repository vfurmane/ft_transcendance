import Image from "next/image";
import { useSelector } from "react-redux";
import { selectUserState } from "../store/UserSlice";
import textStyles from 'styles/text.module.scss';
import styles from 'styles/profil.module.scss';
import { Userfront as User } from "types";
import { relative } from "path";

export default function MiniProfil (props : {key: number, left: boolean, user : {user: User, index : number}, life: number, score : number, game : {life: number, score: number, numOfPlayers : number}}) {
    let hearts : string[] = [];
    for (let i = 0; i < props.life; i++)
        hearts.push("❤️");

    let lifepercent = Math.floor((props.life / props.game.life) * 100);

    let life = (
        <div className={`${styles.flex_between} ${styles.statBar}`}>
            <div
            style={{
                height: "10px",
                backgroundColor: props.left? `rgba(${234}, ${196 - (2 * (100 - (props.life / props.game.life * 100)))}, ${53 - 3 * (100 - (props.life / props.game.life * 100))} , 1)` : '#1e1e1e',
                width: `${props.left? lifepercent   : 100 - lifepercent}%`,
            }}
            ></div>
            <div
            style={{
                height: "10px",
                backgroundColor: props.left? '#1e1e1e' : `rgba(${234}, ${196 - (20 * (props.game.life - props.life))}, ${53 - 30 * (props.game.life - props.life)} , 1)`,
                width: `${props.left? 100 - lifepercent : lifepercent}%`,
            }}
            ></div>
        </div>
    );

    let positionTop : number[] = [];
    let positionLeft : number[] = [];
    switch (props.game.numOfPlayers)
    {
        case 1:
            {
                positionTop = [15];
                positionLeft = [40];
                break;
            }
        case 2:
            {
                positionTop = [13, 13];
                positionLeft = [20, 60];
                break;
            }
        case 3:
            {
                positionTop = [50, 20, 80];
                positionLeft = [5, 50, 50];
                break;
            }
        case 4:
            {
                positionTop = [50, 13, 50, 85];
                positionLeft = [5, 35, 75, 35];
                break;
            }
        case 5:
            {
                positionTop = [50, 13, 30, 70, 80];
                positionLeft = [5, 35, 70, 70, 35];
                break;
            }
        case 6:
            {    
                positionTop = [50, 13, 13, 50, 80, 80];
                positionLeft = [5, 25, 60, 80, 65, 25];
                break;
            }
        default:
            break;
    }

    if (!props.user.user)
        return <></>;
    
    return (
        <div style={{position: 'absolute', top: `${positionTop[props.user.index]}%`, left: `${positionLeft[props.user.index]}%`, width: '20%'}}>
            <div style={{display: 'flex', justifyContent: 'space-around', width: '100%'}}>
                {props.left?
                <div className="fill small">
                    <Image
                        alt="avatar"
                        src={`/avatar/avatar-${props.user.user.avatar_num}.png`}
                        width={42}
                        height={42}
                    />
                </div> 
                :
                 <p
                 style={{
                     color: "white",
                     fontSize: "18px",
                     marginTop: '12px',
                     width: 'auto'
                 }}
                 className={`${textStyles.saira} d-none d-xl-block`}
                 >
                 level :
                 <span
                     id="level"
                     className={textStyles.saira}
                     style={{ fontSize: "20px", color: "white"}}
                 >{props.user.user.level}</span>
                 </p> }
                <h2
                className={`${textStyles.pixel} d-none d-lg-block`}
                style={{
                    color: "white",
                    fontSize: "30px",
                    marginTop: "7px"
                }}
                >
                {props.user.user.name}
                </h2>

                {props.left? 
                <p
                style={{
                    color: "white",
                    fontSize: "18px",
                    marginTop: '12px',
                    width: 'auto'
                }}
                className={`${textStyles.saira} d-none d-xl-block`}
                >
                level:
                <span
                    id="level"
                    className={textStyles.saira}
                    style={{ fontSize: "20px", color: "white"}}
                >{props.user.user.level}</span>
                </p>
                :
                <div className="fill small">
                    <Image
                        alt="avatar"
                        src={`/avatar/avatar-${props.user.user.avatar_num}.png`}
                        width={42}
                        height={42}
                    />
                </div>}
            </div>
            <div className="d-none d-lg-block">
                <div style={{ width: "100%" }}>
                    <div className={styles.flex_between}>
                        <p className={textStyles.saira} style={{ color: "white" }}>
                        {props.user.user.victory} victory
                        </p>
                        <p className={textStyles.saira} style={{ color: "white" }}>
                        {props.user.user.defeat} defeat
                        </p>
                    </div>
                    <div className={`${styles.flex_between} ${styles.statBar}`}>
                        <div
                        style={{
                            height: "3px",
                            backgroundColor: "#03cea4",
                            width: `${Math.floor(
                            (props.user.user.victory / (props.user.user.defeat + props.user.user.victory)) * 100
                            )}%`,
                        }}
                        ></div>
                        <div
                        style={{
                            height: "3px",
                            backgroundColor: "#e22d44",
                            width: `${Math.floor(
                            (props.user.user.defeat / (props.user.user.defeat + props.user.user.victory)) * 100
                            )}%`,
                        }}
                        ></div>
                    </div>
                </div>
            </div>
            <div style={{marginTop: '30px'}} className="d-none d-md-block">
                {props.left?
                <div style={{display: 'flex', margin: '10px', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{width: '75%'}}>{props.game.life > 10? life : hearts}</div>
                    {props.game.numOfPlayers <= 2? <p className={textStyles.laquer} style={{color: 'white', fontSize:`${20 * (1 + (((props.score * 100)/ props.game.score) / 100) * 2)}px`, width: '15%', position: 'absolute', right: '0px'}}>{props.score}</p>:<></>}
                </div> : 
                <div style={{display:'flex', margin: '10px', justifyContent: 'space-between', alignItems: 'center'}}>
                    {props.game.numOfPlayers <= 2? <p className={textStyles.laquer} style={{color: 'white', fontSize:`${20 * (1 + (((props.score * 100)/ props.game.score) / 100) * 2)}px`, width: '15%', position: 'absolute'}}>{props.score}</p> : <></>}
                    <div style={{width: '75%', marginLeft: '25%'}}>{props.game.life > 10? life : hearts}</div>
                </div> }
            </div>
            <div className="d-md-none" style={{marginTop: '30px'}}>
                <div style={{width: '75%', marginLeft: '25%'}}>{life}</div>
            </div>
        </div>
    );
}