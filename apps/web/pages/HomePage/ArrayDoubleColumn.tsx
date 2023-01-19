import React, { useState } from "react";
import styles from "styles/leaderBoard.module.scss";
import textStyle from "styles/text.module.scss";
import entityStyles from "styles/entity.module.scss";

export default function ArrayDoubleColumn(props: {
  title: string;
  list: JSX.Element[];
}): JSX.Element {
  const [columnNum, setColumnNum] = useState(1);
  const [pageNum, setPageNum] = useState(1);

  function prevClick(): void {
    if (columnNum > 1) {
      setColumnNum((prev) => prev - 2);
      setPageNum((prev) => prev - 1);
    }
  }

  function nextClick(): void {
    if (columnNum < Math.floor(props.list.length / 5)) {
      setColumnNum((prev) => prev + 2);
      setPageNum((prev) => prev + 1);
    }
  }

  function getColumn(num: number): JSX.Element[] {
    const column: JSX.Element[] = [];
    if (num > 0 && props.list) {
      for (let i = 0; i < 5; i++) column.push(props.list[i + 5 * (num - 1)]);
    }
    return column;
  }

  return (
    <div className={`card ${styles.card} ${styles.leaderBoard}`}>
      <h2 className={textStyle.pixel}>{props.title}</h2>
      <div className={styles.leaderBoardDoubleColumn}>
        <div>{getColumn(columnNum)}</div>
        <div>{getColumn(columnNum + 1)}</div>
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
          {typeof props.list !== "undefined"
            ? Math.ceil(props.list.length / 10)
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
