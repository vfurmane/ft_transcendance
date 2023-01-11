import React , {use, useEffect, useState} from 'react';

export default function ChatBar() : JSX.Element {
    return (
        <div style={{position:'fixed', zIndex:'99', bottom:'-10px', right:'10px', width:'350px', height:'50px', textAlign:'center', background:'#1e1e1e', borderRadius:'10px'}}>
            <h3>Chat</h3>
        </div>
    );
}