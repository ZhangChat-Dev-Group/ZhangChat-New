/*
 * Description: Pardon a dumb user to be able to speak again
 * Author: simple
 */

import { isIP } from 'net'

// module constructor
export function init(core) {
  if (typeof core.mutedIPs === 'undefined') {
    core.mutedIPs = new Map();
  }
}

// module main
export async function run(core, server, socket, data) {
  if (data.ip === '*') {
    core.mutedIPs.clear()
    server.broadcast({
      cmd: 'info',
      text: `${socket.nick}#${socket.trip} 解除了所有禁言`
    }, { _group: 'root.zhangsoft.zhangchat.group.member' })
    core.logger.info(`(${socket.ip}) ${socket.nick}#${socket.trip} 解除了所有禁言`)
    return true
  }

  let muteModule = core.commands.findBy('id', 'root.zhangsoft.zhangchat.mute')
  if (!muteModule.isMuted(core, data.ip)) return socket.replyWarn(`${data.ip} 目前没有被禁言`)
    
  core.muteIPs.delete(data.ip)
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick}#${socket.trip} 为 ${data.ip} 解除了禁言`
  }, { _group: 'root.zhangsoft.zhangchat.group.member' })
  server.broadcast({
    cmd: 'info',
    text: `管理员已将你的禁言手动解除`
  }, { address: data.ip })

  core.logger.info(`(${socket.ip}) ${socket.nick}#${socket.trip} 解除了禁言：${data.ip}`)
}

export const approve = {
  groups: ['root.zhangsoft.zhangchat.group.mod']
}
export const info = {
  id: 'root.hackchat.speak',
  name: 'unmute',
  aliases: ['speak'],
  description: '解除对某个IP地址的禁言',
  usage: `
    发送 /unmute <IP地址（如需解封所有IP 请填写\\*）>
    API: { cmd: 'speak', ip: '<target ip>' }`,
  runByChat: true,
  dataRules: [{
    name: 'ip',
    required: true,
    verify: ip => !!isIP(ip) || ip === '*'
  }]
};
