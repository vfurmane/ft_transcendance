import React from "react";
import styles from "styles/playButton.module.scss";
import textStyle from "styles/text.module.scss";
import Router from "next/router";


//==================temporary==================================
//i need an array with the current user at index 0 and others after.
//we must do a sort of rotation to be coherent between all user.
//when it's done send the data in the query of the router with pinpong pathname

import { Userfront as User } from "types";
import { useSelector } from "react-redux";
import { selectUserState } from "../../store/UserSlice";
export default function PlayMenu(): JSX.Element {
  const UserStae = useSelector(selectUserState);
  const users : User[] = [];
  users.push(UserStae);
  for (let i = 0; i < 5; i++)
  {
    users.push(
      {
        id: i.toString(),
        name: 'name ' + i.toString(),
        avatar_num: i + 1,
        status: "",
        victory: (i + 1) * 6,
        defeat: (i + 1) * 4,
        rank: (i + 1) + 1,
        level: (i + 1) * 43,
      });
  }
//===============================================================


  return (
    <div>
      <div className={`${styles.playMenuEntity} ${styles.bar}`}>
        <h3 className={textStyle.laquer}>Training</h3>
        <p className={textStyle.saira}>
          Play against a wall to practice aiming the ball.
        </p>
      </div>
      <div className={styles.playMenuEntity} onClick={() => Router.push({
                                                                pathname: '/pingPong',
                                                                query: { users: JSON.stringify(users)}
                                                            })}>
        <h3 className={textStyle.laquer}>Battle royale</h3>
        <p className={textStyle.saira}>
          Play against 100 other players. Be the last one, be the best one!
        </p>
      </div>
    </div>
  );
}
