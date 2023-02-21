import { Socket } from "socket.io";

export default function getCookie(socket : Socket, cName : string) {
   const name = cName + "=";
   if (!socket.handshake.headers.cookie) {
    return null;
   }
   const cDecoded = decodeURIComponent(socket.handshake.headers.cookie);
   const cArr = cDecoded.split(';');
   let res;
   cArr.forEach(val => {
      if (val.trim().indexOf(name) === 0) res = val.trim().substring(name.length);
      })
   return res;
}