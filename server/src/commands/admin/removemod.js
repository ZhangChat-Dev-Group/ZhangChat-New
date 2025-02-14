/*
  Description: Removes target trip from the config as a mod and downgrades the socket type
*/

import { verifyTrip } from '../utility/_StringTester'

// module main
export async function run(core, server, socket, data) {
  core.permissions.leavePermissionGroup(data.trip, 'root.zhangsoft.zhangchat.group.mod')
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick}#${socket.trip} 移除了管理员：${data.trip}`
  }, { _group: 'root.zhangsoft.zhangchat.group.mod' })
  core.permissions.save(true)
}

export const approve = {
  groups: ['root.zhangsoft.zhangchat.group.admin']
}
export const requiredData = ['trip'];
export const info = {
  id: 'root.hackchat.mods.remove',
  name: 'removemod',
  aliases: ['rmmod', 'modremove', 'delmod', 'modrm'],
  description: '将目标识别码从管理员权限组中移除',
  usage: `
    发送 /removemod <识别码>
    API: { cmd: 'removemod', trip: '<target trip>' }`,
  runByChat: true,
  dataRules: [{
    name: 'trip',
    required: true,
    verify: verifyTrip
  }]
};
