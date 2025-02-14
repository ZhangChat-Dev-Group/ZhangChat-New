/**
  * Return an object containing public information about the socket
  * @public
  * @param {WebSocket} socket Target client
  * @return {Object}
  */
export function getUserDetails(socket) {
  return {
    nick: socket.nick,
    trip: socket.trip || '',
    hash: socket.hash,
    userid: socket.userid,
    channel: socket.channel || ''
  };
}