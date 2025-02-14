/*
  Description: Outputs more info than the legacy stats command
*/

// module support functions
const { stripIndents } = require('common-tags');

const formatTime = (time) => {
  let seconds = time[0] + time[1] / 1e9;

  let minutes = Math.floor(seconds / 60);
  seconds %= 60;

  let hours = Math.floor(minutes / 60);
  minutes %= 60;

  const days = Math.floor(hours / 24);
  hours %= 24;

  return `${days.toFixed(0)}天 ${hours.toFixed(0)}时 ${minutes.toFixed(0)}分 ${seconds.toFixed(0)}秒`;
};

// module main
export async function run(core, server, socket) {
  // gather connection and channel count
  let ips = {};
  let channels = {};
  // for (const client of server.clients) {
  server.clients.forEach((client) => {
    if (client.channel) {
      channels[client.channel] = true;
      ips[client.address] = true;
    }
  });

  const uniqueClientCount = Object.keys(ips).length;
  const uniqueChannels = Object.keys(channels).length;

  ips = null;
  channels = null;

  // dispatch info
  server.reply({
    cmd: 'info',
    text: stripIndents`# 小张聊天室服务器状态
                       独立IP用户：${uniqueClientCount}
                       总连接数量：${server.clients.size}
                       活跃频道：${uniqueChannels}
                       HTTP请求次数：${(core.stats.get('http-requests') || 0)}
                       命令执行次数：${(core.stats.get('cmd-executed') || 0)}
                       用户加入次数：${(core.stats.get('users-joined') || 0)}
                       邀请发送次数：${(core.stats.get('invites-sent') || 0)}
                       消息发送数量：${(core.stats.get('messages-sent') || 0)}
                       封禁用户数量：${(core.config.bannedIPs.length || 0)}
                       踢出用户次数：${(core.stats.get('users-kicked') || 0)}
                       状态查看次数：${(core.stats.get('stats-requested') || 0)}
                       服务器已稳定运行：${formatTime(process.hrtime(core.stats.get('start-time')))}`,
  }, socket);

  // stats are fun
  core.stats.increment('stats-requested');
}

export const info = {
  id: 'root.hackchat.stats',
  name: 'stats',
  description: '获取服务器运行信息',
  usage: `
    API: { cmd: 'stats' }
    发送 /stats`,
  runByChat: true,
};
