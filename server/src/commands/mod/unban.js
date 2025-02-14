/*
  Description: Removes a target ip from the ratelimiter
*/

import { isIP } from 'net'

// module main
export async function run(core, server, socket, data) {
  if (data.ip === '*') {
    core.config.bannedIPs = []
    server.broadcast({
      cmd: 'info',
      text: `${socket.nick}#${socket.trip} 解除了所有IP封禁`
    }, { _group: 'root.zhangsoft.zhangchat.group.member' })
  } else {
    server.unban(data.ip)
    server.broadcast({
      cmd: 'info',
      text: `${socket.nick}#${socket.trip} 解除了IP封禁：${data.ip}`
    }, { _group: 'root.zhangsoft.zhangchat.group.member' })
  }

  if (!core.configManager.save()) {
    return server.reply({
      cmd: 'warn',
      text: '无法保存配置文件 请联系站长检查日志',
    }, socket);
  }
}

export const approve = {
  groups: ['root.zhangsoft.zhangchat.group.mod']
}
export const info = {
  id: 'root.hackchat.unban',
  name: 'unban',
  description: '解除封禁特定或者全部的IP地址',
  usage: `
    发送 /unban <IP地址（如需解封所有IP 请填写\\*）>
    API: { cmd: 'unban', ip: '<target ip>' }`,
  runByChat: true,
  dataRules: [{
    name: 'ip',
    required: true,
    verify: ip => !!isIP(ip) || ip === '*'
  }]
};
