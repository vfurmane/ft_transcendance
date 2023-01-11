import React, { useState } from "react";
import Image from 'next/image';
import Achivement from "../../interface/AchivementInterface";



export default function AchivementEntity(props : {achivement: Achivement , key: number, handleClick: (e : {achivement: Achivement})=>void}) : JSX.Element {
    if (typeof props.achivement === 'undefined')
        return <></>;
    return (
        <div className="shadowContainer">
            <div className="cardContainer entity" onClick={()=>props.handleClick({achivement: props.achivement})}>
                <div className="avatarText">
                        <Image  alt='avatar' src={`/achivement.png`} width={32} height={32} style={{marginLeft:'10px'}}/>
                    <div className="entityText">
                        <h3>{props.achivement.name}</h3>
                        <p>{props.achivement.status}</p>
                    </div>
                </div>
            </div>
            <div className="entityShadow d-none d-md-block"></div>
        </div>
    );
}