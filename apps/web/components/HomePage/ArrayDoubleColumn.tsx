import React, { useEffect, useState } from "react";
import styles from "styles/leaderBoard.module.scss";
import textStyle from "styles/text.module.scss";
import entityStyles from "styles/entity.module.scss";
import LeaderboardEntity from "./LeaderboardEntity";
import { Userfront as User } from "types";

export default function ArrayDoubleColumn(props: {
  title: string;
  handleClick: (e: {
    index: number;
    openMenu: boolean;
    setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
  }) => void;
}): JSX.Element {
  const [columnNum, setColumnNum] = useState(1);
  const [pageNum, setPageNum] = useState(1);
  const [leaderBoardList, setLeaderBoardList] = useState<JSX.Element[]>([]);
  const [column1, setColumn1] = useState<JSX.Element[]>([]);
  const [column2, setColumn2] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const tmp: JSX.Element[] = [];
    fetch(`/api/leaderBoard`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials:"same-origin",
    })
      .then((res) => res.json())
      .then((data: User[]) => {
        data.forEach((user, index) => {
          tmp.push(
            <LeaderboardEntity
              key={user.id}
              user={user}
              index={index}
              handleClick={props.handleClick}
            />
          );
        });
        setLeaderBoardList([...tmp]);
      })
      .catch((error) => console.error(`error fetch : ${error.message}`));
  }, [props.handleClick]);

  function prevClick(): void {
    if (columnNum > 1) {
      setColumnNum((prev) => prev - 2);
      setPageNum((prev) => prev - 1);
    }
  }

  function nextClick(): void {
    if (columnNum < Math.ceil(leaderBoardList.length / 10)) {
      setColumnNum((prev) => prev + 2);
      setPageNum((prev) => prev + 1);
    }
  }

  useEffect(() => {
    function getColumn(num: number): JSX.Element[] {
      const column: JSX.Element[] = [];
      if (num > 0 && leaderBoardList) {
        for (let i = 0; i < Math.min(leaderBoardList.length, 5); i++)
          column.push(leaderBoardList[i + 5 * (num - 1)]);
      }
      return column;
    }

    setColumn1(getColumn(columnNum));
    setColumn2(getColumn(columnNum + 1));
  }, [leaderBoardList, columnNum]);

  return (
    <div className={`card ${styles.card} ${styles.leaderBoard}`}>
      <h2 className={textStyle.pixel}>{props.title}</h2>
      <div className={styles.leaderBoardDoubleColumn}>
        <div>{column1}</div>
        <div>{column2}</div>
      </div>
      <div className={entityStyles.shadowContainer}>
        <h3
          className={textStyle.laquer}
          style={{ marginLeft: "10px" }}
          onClick={(): void => prevClick()}
        >
          {"<"}
        </h3>
        <h3 className={textStyle.laquer} style={{ marginLeft: "10px" }}>
          {pageNum}
        </h3>
        <h3 className={textStyle.laquer} style={{ marginLeft: "10px" }}>
          of
        </h3>
        <h3 className={textStyle.laquer} style={{ marginLeft: "10px" }}>
          {typeof leaderBoardList !== "undefined"
            ? Math.ceil(leaderBoardList.length / 10)
            : ""}
        </h3>
        <h3
          className={textStyle.laquer}
          style={{ marginLeft: "10px" }}
          onClick={(): void => nextClick()}
        >
          {">"}
        </h3>
      </div>
    </div>
  );
}
