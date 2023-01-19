import React from "react";
import textStyle from "styles/text.module.scss";
import styles from "styles/entity.module.scss";

export default function List(props: {
  title: string;
  list: JSX.Element[];
}): JSX.Element {
  if (!props.list) return <></>;

  return (
    <div>
      {typeof props.title === "string" && props.title.length ? (
        <h2 className={textStyle.pixel}>{props.title}</h2>
      ) : (
        <></>
      )}
      {props.list[0] &&
      props.list[0].props.user &&
      props.list[0].props.user.id === "-1" ? (
        <div className={styles.shadowContainer} style={{ height: "300px" }}>
          <p className={textStyle.saira}>Add some friend ...</p>
        </div>
      ) : (
        <div className="cardList">
          {!props.list.length ? (
            <div className={styles.shadowContainer} style={{ height: "200px" }}>
              <p className={textStyle.saira} style={{ color: "white" }}>
                I didn't find anyone ...
              </p>
            </div>
          ) : (
            props.list
          )}
        </div>
      )}
    </div>
  );
}
