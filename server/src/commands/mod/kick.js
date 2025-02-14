/*
  Description: Forces a change on the target(s) socket's channel, then broadcasts event
*/

import { verifyNick } from "../utility/_StringTester";

// module main
export async function run(core, server, socket, data) {
  let target = server.getSocket({
    channel: socket.channel,
    nick: data.nick,
  })
  if (!target) return server.reply({
    cmd: 'warn',
    text: `找不到 ${data.nick}`
  }, socket)

  if (core.permissions.inPermissionGroup(target.trip, 'root.zhangsoft.zhangchat.group.mod')) return server.reply({
    cmd: 'warn',
    text: `您不能踢出 ${data.nick}，因为对方属于管理员权限组`
  }, socket)
  server.broadcast({
    cmd: 'info',
    text: `已踢出 ${target.nick}`
  }, { channel: socket.channel })
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick}#${socket.trip} 在 ?${socket.channel} 踢出了 ${target.nick}`
  }, { _group: 'root.zhangsoft.zhangchat.group.member' })
  target.exterminate()    // Dalek: Exterminate!!!
}

export const approve = {
  groups: ['root.zhangsoft.zhangchat.group.mod']
}

export const info = {
  id: 'root.hackchat.kick',
  name: 'kick',
  description: '将目标用户踢出当前频道',
  usage: `
    发送 /kick <目标用户>
    API: { cmd: 'kick', nick: '<target nick>' }`,
  runByChat: true,
  dataRules: [{
    name: 'nick',
    required: true,
    verify: verifyNick,
  }]
};
