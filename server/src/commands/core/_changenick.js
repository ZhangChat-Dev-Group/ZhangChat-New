/*
  Description: Allows calling client to change their current nickname
*/

import { verifyNick } from '../utility/_StringTester'
import { getUserDetails } from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  const previousNick = socket.nick;
  const newNick = data.nick

  if (newNick == previousNick) {
    return server.reply({
      cmd: 'warn',
      text: '新旧昵称相同',
    }, socket);
  }

  // find any sockets that have the same nickname
  const userExists = server.findSockets({
    channel: socket.channel,
    nick: (targetNick) => targetNick.toLowerCase() === newNick.toLowerCase() &&
      // Allow them to rename themselves to a different case
      targetNick != previousNick,
  });

  // return error if found
  if (userExists.length > 0) {
    // That nickname is already in that channel
    return server.reply({
      cmd: 'warn',
      text: '该昵称已被占用',
    }, socket);
  }

  // build join and leave notices
  // TODO: this is a legacy client holdover, name changes in the future will
  //       have thieir own event
  const leaveNotice = {
    cmd: 'onlineRemove',
    nick: socket.nick,
  };

  const joinNotice = {
    cmd: 'onlineAdd',
    ...getUserDetails(socket),
    nick: newNick,
  };

  // broadcast remove event and join event with new name, this is to support legacy clients and bots
  server.broadcast(leaveNotice, { channel: socket.channel });
  server.broadcast(joinNotice, { channel: socket.channel });

  // notify channel that the user has changed their name
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick} 更名为 ${newNick}`,
  }, { channel: socket.channel });

  // commit change to nickname
  socket.nick = newNick;

  return true;
}

export const info = {
  id: 'root.zhangsoft.zhangchat.changenick',
  name: 'changenick',
  aliases: ['chnick', 'nick'],
  description: '修改昵称',
  usage: `
    API: { cmd: 'changenick', nick: '<new nickname>' }
    Text: /nick <新昵称>`,
  runByChat: true,
  dataRules: [{
    name: 'nick',
    verify: verifyNick,
    required: true,
  }],
  rateLimit: 6,
};
