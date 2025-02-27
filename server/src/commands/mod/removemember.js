/*
  Description: Removes target trip from the config as a mod and downgrades the socket type
*/

import { verifyTrip } from '../utility/_StringTester'

// module main
export async function run(core, server, socket, data) {
  core.permissions.leavePermissionGroup(data.trip, 'root.zhangsoft.zhangchat.group.member')
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick}#${socket.trip} 移除了成员：${data.trip}`
  }, { _group: 'root.zhangsoft.zhangchat.group.member' })
  core.permissions.save(true)
}

export const approve = {
  groups: ['root.zhangsoft.zhangchat.group.mod']
}
export const info = {
  id: 'root.hackchat.members.remove',
  name: 'removemember',
  aliases: ['rmmembrr', 'memberremove', 'delmember', 'memberrm'],
  description: '将目标识别码从成员权限组中移除',
  usage: `
    发送 /removemember <识别码>
    API: { cmd: 'removemember', trip: '<target trip>' }`,
  runByChat: true,
  dataRules: [{
    name: 'trip',
    required: true,
    verify: verifyTrip
  }]
};
