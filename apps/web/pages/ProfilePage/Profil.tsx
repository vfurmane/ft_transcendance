import React from "react";
import TopBar from "../TopBar";
import { useRouter } from "next/router";
import Image from "next/image";
import Avatar from '../../asset/Avatar.png';
import MatchEntity from "../HomePage/MatchEntity";

export default function Profil (props : {name: string}) : JSX.Element {
    const router = useRouter();
    const {name} = router.query;
    let listOfMatch = [];

    for (let i = 0; i < 22; i++)
    {
        listOfMatch.push(<MatchEntity name={'name' + (i + 1).toString()} score={5} key={i}/>);
    }

    return (
        <div>
            <TopBar/>
            <div className='container margin_top' > 
                <div className='row'>
                    <div className='col-3'>
                            <Image alt="avatar" src={Avatar} width={200} height={200}/>
                    </div>
                    <div className="col-2 ">
                        <div style={{color:'white', fontSize:'100px'}}>{name}</div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                    <div className='card'>
                            <h2>Match history</h2>
                            {listOfMatch}
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
       
    );
}