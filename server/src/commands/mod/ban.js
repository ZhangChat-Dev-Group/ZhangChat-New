/*
  Description: Adds the target socket's ip to the ratelimiter
*/

import { verifyNick } from '../utility/_StringTester'

// module main
export async function run(core, server, socket, data) {
  const target = server.findSocket({
    channel: socket.channel,
    nick: data.nick
  })

  if (!target) return server.reply({
    cmd: 'warn',
    text: '找不到 ' + data.nick
  }, socket)

  if (core.permissions.inPermissionGroup(target.trip, 'root.zhangsoft.zhangchat.group.mod')) return server.reply({
    cmd: 'warn',
    text: `您不能封禁 ${data.nick}，因为对方属于管理员权限组`
  }, socket)

  server.ban(target.address)
  server.broadcast({
    cmd: 'info',
    text: `已封禁 ${target.nick}`
  }, { channel: socket.channel })
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick}#${socket.trip} 已封禁用户 ${target.nick}\n目标IP地址：${target.address}`
  }, { _group: 'root.zhangsoft.zhangchat.group.member' })

  server.findSockets({ address: target.address }).forEach(s => {
    server.reply({
      cmd: 'warn',
      text: `# : (\n## 下线提醒\n您已被管理员封禁 即将被断开连接\n如需解封 请向管理员或站长提出申请或者申诉 并且提供这个IP地址：${s.address}`
    }, s)
    s.exterminate()    // Dalek: Exterminate!!!
  })

  core.logger.info(`(${socket.ip}) ${socket.nick}#${socket.trip} 封禁了IP地址：${target.address}`)
}

export const approve = {
  groups: ['root.zhangsoft.zhangchat.group.mod']
}
export const info = {
  id: 'root.hackchat.ban',
  name: 'ban',
  description: '通过昵称封禁一个用户 其实质是封禁IP地址',
  usage: `
    发送 /ban <目标用户>
    API: { cmd: 'ban', nick: '<target nickname>' }`,
  runByChat: true,
  dataRules: [{
    name: 'nick',
    required: true,
    verify: verifyNick,
  }],
};
