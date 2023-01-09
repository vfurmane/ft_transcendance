import React from "react";
import TopBar from "../TopBar";
import { useRouter } from "next/router";
import Image from "next/image";
import Avatar from '../../public/avatar/avatar-6.png';
import MatchEntity from "../HomePage/MatchEntity";

export default function Profil(props: { name: string }): JSX.Element {
    const router = useRouter();
    const { name } = router.query;
    let listOfMatch = [];

    for (let i = 0; i < 22; i++) {
        listOfMatch.push(<MatchEntity url1={`/avatar/avatar-${Math.floor(Math.random() * 19) + 1}.png`} url2={`/avatar/avatar-${Math.floor(Math.random() * 19) + 1}.png`} name={'name' + (i + 1).toString()} score={5} key={i} />);
    }

    let victory = 400;
    let defeat = 200;

   

    return (
        <div>
            <TopBar />
            <div className='container margin_top' >
                <div className='row'>
                    <div className='col-10 offset-1 col-sm-4 col-md-2' style={{ display: 'flex', justifyContent:'center', alignItems: 'center' }}>
                        <div className="fill">
                            <Image alt="avatar" src={'/avatar/avatar-6.png'} width={200} height={200} />
                        </div>
                    </div>
                    <div className="col-10 offset-1  col-md-6 offset-md-0" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '50px', marginBottom: '50px', width: 'auto' }}>
                        <div>
                            <h2 style={{ color: 'white', fontSize: '40px', marginBottom: '10px' }}>{name}</h2>
                            <div style={{ display: 'flex', textAlign: 'center', justifyContent: 'flex-start', width: '60%', borderRadius: '8px', overflow: 'hidden' }}>
                                <p style={{ color: 'white', backgroundColor: 'rgba(39,255,39,0.6)', width: `${(victory/(defeat + victory)) * 100}%`, padding: '5px' }}>{victory} victory</p>
                                <p style={{ color: 'white', backgroundColor: 'rgba(255,0,0,0.6)', width: `${(defeat/(defeat + victory)) * 100}%`, padding: '5px' }}>{defeat} defeat</p>
                            </div>
                            <div style={{ display: 'flex', textAlign: 'center', justifyContent: 'flex-start', flexWrap:'wrap', borderRadius: '8px', margin:'10px' }}>
                                <button className="buttonProfil"><h3 style={{fontSize:'18px'}}>Change password</h3></button>
                                <button className="buttonProfil"><h3 style={{fontSize:'18px'}}>Configure TFA</h3></button>
                                <button className="buttonProfil"><h3 style={{fontSize:'18px'}}>Delete account</h3></button>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="row">
                    <div className="col-10 offset-1 col-lg-6" >
                        <div className='card' style={{backgroundColor:'rgba(0,0,0,0)'}}>
                            <h2>Match history</h2>
                            {listOfMatch}
                        </div>
                    </div>
                </div>
            </div>

        </div>

    );
}