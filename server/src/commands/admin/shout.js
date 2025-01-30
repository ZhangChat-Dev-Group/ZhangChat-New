/*
  Description: Emmits a server-wide message as `info`
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin
  if (!UAC.isAdmin(socket.level)) {
    return server.police.frisk(socket.address, 20);
  }

  // send text to all channels
  server.broadcast({
    cmd: 'info',
    text: `Server Notice: ${data.text}`,
  }, {});

  return true;
}

export const approve = {
  groups: ['root.zhangsoft.zhangchat.group.admin']
}
export const requiredData = ['text'];
export const info = {
  id: 'root.zhangsoft.zhangchat.shout',
  name: 'shout',
  description: 'Displays passed text to every client connected',
  usage: `
    API: { cmd: 'shout', text: '<shout text>' }`,
};
