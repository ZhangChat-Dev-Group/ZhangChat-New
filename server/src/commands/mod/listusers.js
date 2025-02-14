/*
  Description: Outputs all current channels and their user nicks
*/

// module main
export async function run(core, server, socket) {
  // find all users currently in a channel
  const currentUsers = server.findSockets({
    channel: (channel) => true,
  });

  // compile channel and user list
  const channels = {};
  for (let i = 0, j = currentUsers.length; i < j; i += 1) {
    if (typeof channels[currentUsers[i].channel] === 'undefined') {
      channels[currentUsers[i].channel] = [];
    }

    channels[currentUsers[i].channel].push(
      `[${currentUsers[i].trip || 'null'}]${currentUsers[i].nick}`,
    );
  }

  // build output
  const lines = [];
  for (const channel in channels) {
    lines.push(`?${channel} ${channels[channel].join(', ')}`);
  }

  // send reply
  server.reply({
    cmd: 'info',
    text: lines.join('\n'),
  }, socket);

  return true;
}

export const approve = {
  groups: ['root.zhangsoft.zhangchat.group.mod']
}
export const info = {
  id: 'root.hackchat.listusers',
  name: 'listusers',
  aliases: ['lsusers'],
  description: '显示所有在线用户以及活跃的频道',
  usage: `
    API: { cmd: 'listusers' }
    发送 /listusers`,
  runByChat: true,
};
